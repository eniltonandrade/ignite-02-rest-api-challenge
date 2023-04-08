// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      created_at: string
      date_and_time: string
      session_id?: string
      in_diet: boolean
    },
    users: {
      id: string,
      name: string,
      email: string,
      password: string
    }
  }
}
