import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').index()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.dateTime('date_and_time').notNullable()
    table.boolean('in_diet').notNullable()
    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropForeign('user_id')
  })
  await knex.schema.dropTable('meals')
}
