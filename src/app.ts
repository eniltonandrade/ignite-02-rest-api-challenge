import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals'
import { authRoutes } from './routes/auth'

export const app = fastify()

app.register(fastifyCookie)

app.register(authRoutes, {
  prefix: 'auth',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})
