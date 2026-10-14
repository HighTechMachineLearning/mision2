const UMBRAL_MODERADO = 4;
const UMBRAL_FUERTE = 6;

export function clasificarNivel(magnitud) {
    if (magnitud >= UMBRAL_FUERTE) return "fuerte";
    if (magnitud >= UMBRAL_MODERADO) return "moderado";
    return "leve";
}

export function calcularEstadisticas(sismos) {
    const porNivel = sismos.reduce(
        (acumulado, { magnitud }) => {
            const nivel = clasificarNivel(magnitud);
            return { ...acumulado, [nivel]: acumulado[nivel] + 1 };
        },
        { leve: 0, moderado: 0, fuerte: 0 }
    );

    if (sismos.length === 0) {
        return { total: 0, maxima: null, media: null, porNivel };
    }

    const maxima = sismos.reduce((mayor, { magnitud }) => Math.max(mayor, magnitud), -Infinity);
    const suma = sismos.reduce((acumulado, { magnitud }) => acumulado + magnitud, 0);

    return {
        total: sismos.length,
        maxima,
        media: suma / sismos.length,
        porNivel,
    };
}

export function filtrarSismos(sismos, { magnitudMinima, texto }) {
    const textoNormalizado = texto.trim().toLowerCase();

    return sismos.filter(
        ({ magnitud, lugar }) =>
            magnitud >= magnitudMinima && lugar.toLowerCase().includes(textoNormalizado)
    );
}

export function ordenarSismos(sismos, criterio) {
    const campo = criterio === "magnitud" ? "magnitud" : "fecha";
    return sismos.toSorted((a, b) => b[campo] - a[campo]);
}
