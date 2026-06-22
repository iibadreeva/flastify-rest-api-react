import { asc, eq } from 'drizzle-orm'

import { courses, courseLessons } from '../../db/schema.js'

const perPage = 2

// Допустимые поля курса (используются в схемах create/update).
const courseProperties = {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    creatorId: { type: 'integer', minimum: 1 },
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
    required: ['name', 'description', 'creatorId'],
    additionalProperties: false,
    properties: courseProperties,
}

const updateBody = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: courseProperties,
}

export default async function (fastify) {
    // GET /courses?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            return fastify.db.query.courses.findMany({
                orderBy: asc(courses.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })
        },
    )

    // GET /courses/:id — курс вместе с уроками
    fastify.get(
        '/:id',
        { schema: { params: idParams } },
        async (request) => {
            const { id } = request.params

            const course = await fastify.db.query.courses.findFirst({
                where: eq(courses.id, id),
            })

            fastify.assert(course, 404, 'Курс не найден')

            const lessons = fastify.db
                .select()
                .from(courseLessons)
                .where(eq(courseLessons.courseId, id))
                .all()

            return { ...course, lessons }
        },
    )

    // POST /courses — создание (только для авторизованных)
    fastify.post(
        '/',
        { schema: { body: createBody }, onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const [course] = await fastify.db.insert(courses)
                .values(request.body)
                .returning()

            return reply.code(201).send(course)
        },
    )

    // PATCH /courses/:id — обновление (только для авторизованных)
    fastify.patch(
        '/:id',
        { schema: { params: idParams, body: updateBody }, onRequest: [fastify.authenticate] },
        async (request) => {
            const { id } = request.params

            const [course] = await fastify.db.update(courses)
                .set(request.body)
                .where(eq(courses.id, id))
                .returning()

            fastify.assert(course, 404, 'Курс не найден')

            return course
        },
    )

    // DELETE /courses/:id — удаление (только для авторизованных)
    fastify.delete(
        '/:id',
        { schema: { params: idParams }, onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params

            const [course] = await fastify.db.delete(courses)
                .where(eq(courses.id, id))
                .returning()

            fastify.assert(course, 404, 'Курс не найден')

            return reply.code(204).send()
        },
    )
}
