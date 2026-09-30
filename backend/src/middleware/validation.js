/**
 * Validate req.body (and optionally req.query / req.params) against Joi schemas.
 * On failure, responds 400 with the first validation message — no stack traces leaked.
 */
export function validate({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      if (body) req.body = validateSchema(body, req.body);
      if (query) req.query = validateSchema(query, req.query);
      if (params) req.params = validateSchema(params, req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}

function validateSchema(schema, data) {
  const { value, error } = schema.validate(data, {
    abortEarly: true,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const message = error.details[0].message.replace(/"/g, '');
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
  return value;
}
