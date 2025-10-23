import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  JWT_PUBLIC_KEY: Joi.string().allow('').optional(), // Public key for custom JWT validation
  CORS_ORIGIN: Joi.string().default('*'),
  // Cognito configuration
  COGNITO_JWKS_URI: Joi.string().optional(),
  COGNITO_ISSUER: Joi.string().optional(),
  COGNITO_CLIENT_ID: Joi.string().optional(),
});


