export class ErrorApi extends Error {
    constructor(mensaje, opciones) {
        super(mensaje, opciones);
        this.name = this.constructor.name;
    }
}

export class ErrorDeRed extends ErrorApi { }

export class ErrorHttp extends ErrorApi {
    constructor(status, opciones) {
        super(`El servidor respondió con el estado ${status}`, opciones);
        this.status = status;
    }
}

export class ErrorDeDatos extends ErrorApi { }
