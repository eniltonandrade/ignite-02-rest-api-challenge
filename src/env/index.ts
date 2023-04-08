import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DB_URL: z.string(),
  DB_CLIENT: z.enum(['sqlite', 'pg']),
  PORT: z.coerce.number().default(3333), // transforms whatever type is inserted into number
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('🚨 Invalid enviroment variable', _env.error.format())
  throw new Error('Invalid enviroment variable')
}

export const env = _env.data
