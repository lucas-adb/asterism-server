import 'dotenv/config';
import z from 'zod';

const defaultPortNumber = 3333;

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(defaultPortNumber),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.url(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  const prettyError = z.prettifyError(_env.error);
  throw new Error(prettyError);
}

export const env = _env.data;
