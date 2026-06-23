import { asc, eq, count } from 'drizzle-orm'

import { courses, courseLessons } from '../../db/schema.js'

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
    // Возвращает курс по id, проверяя его существование (404) и то,
    // что текущий пользователь является его автором (403). Автор урока —
    // это автор курса, к которому урок прикреплён.
    const assertCourseOwnership = async (courseId, userId) => {
        const course = await fastify.db.query.courses.findFirst({
            where: eq(courses.id, courseId),
        })
        fastify.assert(course, 404, 'Курс не найден')
        fastify.assert(course.creatorId === userId, 403, 'Недостаточно прав')

        return course
    }

    // GET /lessons?page=2 — список с пагинацией
    fastify.get(
        '/',
        { schema: { tags: ['lessons'], querystring: listQuerystring } },
        async (request) => {
            const { page } = request.query

            // Сами элементы текущей страницы (limit/offset = пагинация).
            const data = await fastify.db.query.courseLessons.findMany({
                orderBy: asc(courseLessons.id),
                limit: perPage,
                offset: (page - 1) * perPage,
            })

            // Общее количество записей в таблице — для метаданных пагинации.
            const [{ total }] = await fastify.db
                .select({ total: count() })
                .from(courseLessons)

            // meta: текущая страница, размер страницы и всего элементов.
            return { data, meta: { page, perPage, total } }
        },
    )

    // GET /lessons/:id
    fastify.get(
        '/:id',
        { schema: { tags: ['lessons'], params: idParams } },
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
        {
            schema: { tags: ['lessons'], body: createBody, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request, reply) => {
            // Создавать урок может только автор курса, к которому он привязан.
            await assertCourseOwnership(request.body.courseId, request.user.id)

            const [lesson] = await fastify.db.insert(courseLessons)
                .values(request.body)
                .returning()

            return reply.code(201).send(lesson)
        },
    )

    // PATCH /lessons/:id — обновление (только для авторизованных)
    fastify.patch(
        '/:id',
        {
            schema: { tags: ['lessons'], params: idParams, body: updateBody, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request) => {
            const { id } = request.params

            const lesson = await fastify.db.query.courseLessons.findFirst({
                where: eq(courseLessons.id, id),
            })
            fastify.assert(lesson, 404, 'Урок не найден')

            // Редактировать урок может только автор курса, к которому он привязан.
            await assertCourseOwnership(lesson.courseId, request.user.id)

            // Если урок переносят в другой курс — этот курс тоже должен
            // принадлежать текущему пользователю.
            if (request.body.courseId && request.body.courseId !== lesson.courseId) {
                await assertCourseOwnership(request.body.courseId, request.user.id)
            }

            const [updated] = await fastify.db.update(courseLessons)
                .set(request.body)
                .where(eq(courseLessons.id, id))
                .returning()

            return updated
        },
    )

    // DELETE /lessons/:id — удаление (только для авторизованных)
    fastify.delete(
        '/:id',
        {
            schema: { tags: ['lessons'], params: idParams, security: [{ bearerAuth: [] }] },
            onRequest: [fastify.authenticate],
        },
        async (request, reply) => {
            const { id } = request.params

            const lesson = await fastify.db.query.courseLessons.findFirst({
                where: eq(courseLessons.id, id),
            })
            fastify.assert(lesson, 404, 'Урок не найден')

            // Удалять урок может только автор курса, к которому он привязан.
            await assertCourseOwnership(lesson.courseId, request.user.id)

            await fastify.db.delete(courseLessons).where(eq(courseLessons.id, id))

            return reply.code(204).send()
        },
    )
}
