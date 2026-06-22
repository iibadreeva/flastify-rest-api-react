import { asc, eq } from 'drizzle-orm'

import { courseLessons } from '../../db/schema.js'

const perPage = 2

// Допустимые поля урока (используются в схемах create/update).
const lessonProperties = {
    name: { type: 'string', minLength: 1 },
    body: { type: 'string', minLength: 1 },
    courseId: { type: 'integer', minimum: 1 },
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
    required: ['name', 'body', 'courseId'],
    additionalProperties: false,
    properties: lessonProperties,
}

const updateBody = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: lessonProperties,
}

export default async function (fastify) {
    // GET /lessons?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            return fastify.db.query.courseLessons.findMany({
                orderBy: asc(courseLessons.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })
        },
    )

    // GET /lessons/:id
    fastify.get(
        '/:id',
        { schema: { params: idParams } },
        async (request) => {
            const { id } = request.params

            const lesson = await fastify.db.query.courseLessons.findFirst({
                where: eq(courseLessons.id, id),
            })

            fastify.assert(lesson, 404, 'Урок не найден')

            return lesson
        },
    )

    // POST /lessons — создание (только для авторизованных)
    fastify.post(
        '/',
        { schema: { body: createBody }, onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const [lesson] = await fastify.db.insert(courseLessons)
                .values(request.body)
                .returning()

            return reply.code(201).send(lesson)
        },
    )

    // PATCH /lessons/:id — обновление (только для авторизованных)
    fastify.patch(
        '/:id',
        { schema: { params: idParams, body: updateBody }, onRequest: [fastify.authenticate] },
        async (request) => {
            const { id } = request.params

            const [lesson] = await fastify.db.update(courseLessons)
                .set(request.body)
                .where(eq(courseLessons.id, id))
                .returning()

            fastify.assert(lesson, 404, 'Урок не найден')

            return lesson
        },
    )

    // DELETE /lessons/:id — удаление (только для авторизованных)
    fastify.delete(
        '/:id',
        { schema: { params: idParams }, onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params

            const [lesson] = await fastify.db.delete(courseLessons)
                .where(eq(courseLessons.id, id))
                .returning()

            fastify.assert(lesson, 404, 'Урок не найден')

            return reply.code(204).send()
        },
    )
}
