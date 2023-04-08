/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { CheckUserIdExists } from '../middlewares/check-if-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date_and_time: z.string().datetime(),
        in_diet: z.boolean(),
      })

      const { name, description, date_and_time, in_diet } =
        createMealBodySchema.parse(request.body)

      const userId = request.cookies.userId

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        user_id: userId,
        date_and_time,
        in_diet,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request, reply) => {
      const { userId } = request.cookies

      const meals = await knex('meals').where('user_id', userId).select()

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = request.cookies

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .first()

      return { meal }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = request.cookies

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').delete().where({
        id,
        user_id: userId,
      })

      return reply.status(204).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date_and_time: z.string().datetime(),
        in_diet: z.boolean(),
      })

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = request.cookies

      const { id } = getMealParamsSchema.parse(request.params)

      const { name, description, date_and_time, in_diet } =
        createMealBodySchema.parse(request.body)

      await knex('meals')
        .update({
          name,
          description,
          date_and_time,
          in_diet,
        })
        .where({
          id,
          user_id: userId,
        })

      return reply.status(201).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [CheckUserIdExists],
    },
    async (request, reply) => {
      const { userId } = request.cookies

      const meals = await knex('meals')
        .where({ user_id: userId })
        .select()
        .orderBy('date_and_time')

      const totalMeals = meals.length

      const mealsInDiet = meals.filter((item) => item.in_diet)
      const totalMealsOffDiet = meals.filter((item) => !item.in_diet).length

      const transformedDates = mealsInDiet.map((item) => {
        return new Date(item.date_and_time).toDateString()
      })

      const uniqueDatesTransformed = [...new Set(transformedDates)]
      let biggestSequence = 1
      let count = 1

      for (let i = 0; i < uniqueDatesTransformed.length; i++) {
        const date = new Date(uniqueDatesTransformed[i])
        const previousDate = new Date(uniqueDatesTransformed[i - 1])
        const nextDateFromPreviousDate = previousDate.setDate(
          previousDate.getDate() + 1,
        )

        if (date.getTime() === new Date(nextDateFromPreviousDate).getTime()) {
          count++
        } else {
          if (count > biggestSequence) {
            biggestSequence = count
          }
          count = 1
        }
      }

      return reply.status(200).send({
        totalMeals,
        totalMealsInDiet: mealsInDiet.length,
        totalMealsOffDiet,
        bestDietSequence: biggestSequence,
      })
    },
  )
}
