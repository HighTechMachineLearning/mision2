import { obtenerSismos } from "./api.js";
import { ErrorDeRed, ErrorHttp, ErrorDeDatos } from "./errors.js";
import { calcularEstadisticas, filtrarSismos, ordenarSismos } from "./logic.js";
import {
    mostrarCargando,
    mostrarError,
    mostrarVacio,
    renderizarEstadisticas,
    renderizarSismos,
} from "./render.js";

const estado = {
    sismos: [],
    periodo: "day",
    magnitudMinima: 2.5,
    texto: "",
    orden: "fecha",
};

function mensajeParaUsuario(error) {
    if (error instanceof ErrorDeRed) {
        return "No se pudo conectar con el servidor. Comprueba tu conexión a internet.";
    }
    if (error instanceof ErrorHttp) {
        return error.status >= 500
            ? "El servicio del USGS no está disponible ahora mismo. Inténtalo más tarde."
            : `No se pudieron obtener los datos (error ${error.status}).`;
    }
    if (error instanceof ErrorDeDatos) {
        return "Los datos recibidos no son válidos.";
    }
    return "Ha ocurrido un error inesperado.";
}

function actualizarVista() {
    const filtrados = filtrarSismos(estado.sismos, estado);
    const ordenados = ordenarSismos(filtrados, estado.orden);

    renderizarEstadisticas(calcularEstadisticas(filtrados));

    if (ordenados.length === 0) {
        mostrarVacio();
    } else {
        renderizarSismos(ordenados);
    }
}

async function cargarSismos() {
    mostrarCargando();
    try {
        estado.sismos = await obtenerSismos(estado.periodo);
        actualizarVista();
    } catch (error) {
        mostrarError(mensajeParaUsuario(error), cargarSismos);
    }
}

cargarSismos();
