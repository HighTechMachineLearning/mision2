import { ErrorDeRed, ErrorHttp, ErrorDeDatos } from "./errors.js";

const URL_BASE = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_";

export function normalizarSismo({ id, properties, geometry }) {
    const { mag, place, time, url, tsunami } = properties ?? {};

    if (!Number.isFinite(mag)) return null;

    return {
        id,
        magnitud: mag,
        lugar: place ?? "Lugar desconocido",
        fecha: time,
        profundidad: geometry?.coordinates?.[2] ?? null,
        tsunami: tsunami === 1,
        url,
    };
}

export async function obtenerSismos(periodo) {
    let respuesta;
    try {
        respuesta = await fetch(`${URL_BASE}${periodo}.geojson`);
    } catch (error) {
        throw new ErrorDeRed("No se pudo conectar con el servidor", { cause: error });
    }

    if (!respuesta.ok) throw new ErrorHttp(respuesta.status);

    let json;
    try {
        json = await respuesta.json();
    } catch (error) {
        throw new ErrorDeDatos("La respuesta no es un JSON válido", { cause: error });
    }

    if (!Array.isArray(json?.features)) {
        throw new ErrorDeDatos("La respuesta no tiene la estructura esperada");
    }

    return json.features
        .filter((feature) => feature !== null && typeof feature === "object")
        .map(normalizarSismo)
        .filter((sismo) => sismo !== null);
}
