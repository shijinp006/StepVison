export class HttpError extends Error {
    // `errors` optionally maps field names to messages so clients can show them per field.
    constructor(status, message, errors) {
        super(message);
        this.status = status;
        if (errors) this.errors = errors;
    }
}
