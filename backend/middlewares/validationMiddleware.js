// middlewares/validationMiddleware.js
function validationMiddleware(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        details: error.details.map((d) => d.message),
      });
    }

    next();
  };
}

module.exports = validationMiddleware;
