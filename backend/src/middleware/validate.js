import { HttpError } from '../utils/HttpError.js';

// Runs a validator against req.body, req.params or req.query.
// A validator receives the raw input and returns { value, errors }, where
// `errors` maps field names to messages. On success the cleaned value is
// stored on req.validated[source] for the controller to use. On failure a
// 400 goes to the error handler, which also deletes any image multer saved.
export const validate = (validator, source = 'body') => (req, res, next) => {
    const { value, errors } = validator(req[source] ?? {});

    if (Object.keys(errors).length > 0) {
        return next(new HttpError(400, Object.values(errors).join(', '), errors));
    }

    req.validated = { ...req.validated, [source]: value };
    next();
};
