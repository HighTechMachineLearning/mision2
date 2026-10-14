import { clasificarNivel } from "./logic.js";

const elementoEstado = document.querySelector("#estado");
const listaSismos = document.querySelector("#lista-sismos");
const plantillaSismo = document.querySelector("#plantilla-sismo");

const elementosEstadisticas = {
    total: document.querySelector("#stat-total"),
    maxima: document.querySelector("#stat-maxima"),
    media: document.querySelector("#stat-media"),
    leve: document.querySelector("#stat-leves"),
    moderado: document.querySelector("#stat-moderados"),
    fuerte: document.querySelector("#stat-fuertes"),
};

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
});

function escribirEstado(mensaje, rol = "status") {
    elementoEstado.setAttribute("role", rol);
    elementoEstado.textContent = mensaje;
}

function formatearMagnitud(magnitud) {
    return magnitud === null ? "–" : magnitud.toFixed(1);
}

function crearTarjeta({ magnitud, lugar, fecha, profundidad, tsunami, url }) {
    const tarjeta = plantillaSismo.content.cloneNode(true);

    tarjeta.querySelector(".sismo").dataset.nivel = clasificarNivel(magnitud);
    tarjeta.querySelector(".sismo__magnitud").textContent = formatearMagnitud(magnitud);
    tarjeta.querySelector(".sismo__lugar").textContent = lugar;

    const elementoFecha = tarjeta.querySelector(".sismo__fecha");
    if (Number.isFinite(fecha)) {
        const fechaSismo = new Date(fecha);
        elementoFecha.dateTime = fechaSismo.toISOString();
        elementoFecha.textContent = formatoFecha.format(fechaSismo);
    } else {
        elementoFecha.textContent = "Fecha desconocida";
    }

    tarjeta.querySelector(".sismo__profundidad").textContent = Number.isFinite(profundidad)
        ? `${Math.round(profundidad)} km de profundidad`
        : "Profundidad desconocida";

    tarjeta.querySelector(".sismo__tsunami").hidden = !tsunami;

    const enlace = tarjeta.querySelector(".sismo__enlace");
    if (url) {
        enlace.href = url;
    } else {
        enlace.hidden = true;
    }

    return tarjeta;
}

export function mostrarCargando() {
    listaSismos.replaceChildren();
    escribirEstado("Cargando sismos…");
}

export function mostrarError(mensaje, alReintentar) {
    listaSismos.replaceChildren();
    escribirEstado(mensaje, "alert");

    const botonReintentar = document.createElement("button");
    botonReintentar.type = "button";
    botonReintentar.textContent = "Reintentar";
    botonReintentar.addEventListener("click", alReintentar);
    elementoEstado.append(" ", botonReintentar);
}

export function mostrarVacio() {
    listaSismos.replaceChildren();
    escribirEstado("Ningún sismo con estos filtros");
}

export function renderizarEstadisticas({ total, maxima, media, porNivel }) {
    elementosEstadisticas.total.textContent = total;
    elementosEstadisticas.maxima.textContent = formatearMagnitud(maxima);
    elementosEstadisticas.media.textContent = formatearMagnitud(media);
    elementosEstadisticas.leve.textContent = porNivel.leve;
    elementosEstadisticas.moderado.textContent = porNivel.moderado;
    elementosEstadisticas.fuerte.textContent = porNivel.fuerte;
}

export function renderizarSismos(sismos) {
    escribirEstado("");
    listaSismos.replaceChildren(...sismos.map(crearTarjeta));
}
