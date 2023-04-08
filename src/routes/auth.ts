import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createMealBodySchema.parse(request.body)

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await knex('users')
      .insert({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
      })
      .returning(['id'])

    return reply.status(201).send({ user })
  })

  app.post('/login', async (request, reply) => {
    const createMealBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { userId } = request.cookies

    if (userId) {
      reply.clearCookie('userId')
    }

    const { email, password } = createMealBodySchema.parse(request.body)

    const user = await knex('users')
      .where({
        email,
      })
      .first()

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
      })
    }

    const isAuthorized = await bcrypt.compare(password, user?.password)

    if (isAuthorized) {
      reply.cookie('userId', user.id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    } else {
      return reply.status(401).send({
        error: 'Unauthorized',
      })
    }

    return reply.status(200).send()
  })
}
