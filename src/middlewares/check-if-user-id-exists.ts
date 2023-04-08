import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function CheckUserIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userIdFromCookie = request.cookies.userId

  const user = await knex('users')
    .where({
      id: userIdFromCookie,
    })
    .first()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
