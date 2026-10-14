const DURACION_MS = 5 * 60 * 1000;

export function leerCache(clave) {
    try {
        const texto = localStorage.getItem(clave);
        if (texto === null) return null;

        const { guardadoEn, datos } = JSON.parse(texto);
        if (Date.now() - guardadoEn > DURACION_MS) return null;

        return datos;
    } catch {
        return null;
    }
}

export function guardarCache(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify({ guardadoEn: Date.now(), datos }));
    } catch {
        // Cuota llena o localStorage no disponible: la app sigue sin caché.
    }
}
