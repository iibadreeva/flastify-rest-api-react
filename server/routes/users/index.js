import { asc, eq } from 'drizzle-orm'

import { users, courses } from '../../db/schema.js'

const perPage = 2

// Допустимые поля пользователя (используются в схемах create/update).
const userProperties = {
    fullName: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
}

const listQuerystring = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
    },
}

const idParams = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'integer' },
    },
}

const createBody = {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: userProperties,
}

const updateBody = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: userProperties,
}

export default async function (fastify) {
    // GET /users?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            return fastify.db.query.users.findMany({
                orderBy: asc(users.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })
        },
    )

    // GET /users/:id — пользователь вместе с его курсами
    fastify.get(
        '/:id',
        { schema: { params: idParams } },
        async (request) => {
            const { id } = request.params

            const user = await fastify.db.query.users.findFirst({
                where: eq(users.id, id),
            })

            fastify.assert(user, 404, 'Пользователь не найден')

            const userCourses = fastify.db
                .select()
                .from(courses)
                .where(eq(courses.creatorId, id))
                .all()

            return { ...user, courses: userCourses }
        },
    )

    // POST /users — создание
    fastify.post(
        '/',
        { schema: { body: createBody } },
        async (request, reply) => {
            const [user] = await fastify.db.insert(users)
                .values(request.body)
                .returning()

            return reply.code(201).send(user)
        },
    )

    // PATCH /users/:id — обновление
    fastify.patch(
        '/:id',
        { schema: { params: idParams, body: updateBody } },
        async (request) => {
            const { id } = request.params

            const [user] = await fastify.db.update(users)
                .set({ ...request.body, updatedAt: new Date().toISOString() })
                .where(eq(users.id, id))
                .returning()

            fastify.assert(user, 404, 'Пользователь не найден')

            return user
        },
    )

    // DELETE /users/:id — удаление
    fastify.delete(
        '/:id',
        { schema: { params: idParams } },
        async (request, reply) => {
            const { id } = request.params

            const [user] = await fastify.db.delete(users)
                .where(eq(users.id, id))
                .returning()

            fastify.assert(user, 404, 'Пользователь не найден')

            // Обязательно вызывать send(), иначе обработка зависнет
            return reply.code(204).send()
        },
    )
}
