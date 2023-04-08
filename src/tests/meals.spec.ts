import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../app'

import request from 'supertest'

async function authenticateUser() {
  await request(app.server).post('/auth/register').send(newUserRequest)

  const loginUserResponse = await request(app.server).post('/auth/login').send({
    email: 'enilton.andrade@hotmail.com.br',
    password: '12345',
  })

  const cookies = loginUserResponse.get('Set-Cookie')

  return cookies
}

const newMealRequest = {
  name: 'Almoço',
  description: 'pão doce e café com leite',
  date_and_time: '2023-07-18T14:00:00Z',
  in_diet: true,
}

const newUserRequest = {
  name: 'Enilton Rodrigues de Andrade',
  email: 'enilton.andrade@hotmail.com.br',
  password: '12345',
}

describe('Meal Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to list all means', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Almoço',
        description: 'pão doce e café com leite',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Almoço',
        description: 'pão doce e café com leite',
      }),
    )
  })

  it('should be able to get a edit a meal', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Janta',
        description: 'cachorro quente',
        date_and_time: '2023-07-18T14:00:00Z',
        in_diet: true,
      })
      .expect(201)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Janta',
        description: 'cachorro quente',
      }),
    )
  })

  it('should be able to get a delete a meal', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able get the metrics', async () => {
    const cookies = await authenticateUser()

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    await request(app.server)
      .post('/meals')
      .send(newMealRequest)
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body).toEqual({
      totalMeals: 2,
      totalMealsInDiet: 2,
      totalMealsOffDiet: 0,
      bestDietSequence: 1,
    })
  })
})
