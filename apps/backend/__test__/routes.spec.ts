import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { ROLE_VALUES, generateId } from '@pagewise/shared'

import { registerMiddleware } from '../config/middleware.js'
import { registerRoutes } from '../config/routes.js'
import { db, pool } from '../db/index.js'
import { seedAdmin } from '../db/seedAdmin.js'
import { projects } from '../models/Project.js'
import { sessions } from '../models/Session.js'
import { ADMIN_USER_ID, users } from '../models/User.js'
import { hashToken } from '../utils/helpers.js'
import { sessionStore } from '../utils/sessionStore.js'

const app = express()
registerMiddleware(app)
registerRoutes(app)

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

const login = async (username: string, password: string): Promise<string> => {
  const response = await request(app).post('/api/auth/login').send({ username, password })
  expect(response.status).toBe(200)
  return response.body.data.sessionToken
}

const loginAdmin = () => login('admin', 'admin-password')

const createUser = async (adminToken: string, username: string) => {
  const response = await request(app)
    .post('/api/v1/users')
    .set(bearer(adminToken))
    .send({ username, name: username, password: 'user-password' })
  expect(response.status).toBe(201)
  return response.body.data
}

const createProject = async (token: string) => {
  const response = await request(app).post('/api/v1/projects').set(bearer(token))
  expect(response.status).toBe(201)
  return response.body.data
}

const createBoard = async (token: string, projectId: number) => {
  const response = await request(app).post(`/api/v1/projects/${projectId}/board`).set(bearer(token))
  expect(response.status).toBe(201)
  return response.body.data
}

beforeEach(async () => {
  await db.delete(sessions)
  await db.delete(projects)
  await db.delete(users)
  await seedAdmin()
})

afterAll(async () => {
  await pool.end()
})

describe('health', () => {
  it('reports ok without a session', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})

describe('auth', () => {
  it('logs the seeded admin in case-insensitively and returns them from /me', async () => {
    const token = await login('ADMIN', 'admin-password')

    const response = await request(app).get('/api/v1/users/me').set(bearer(token))

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({ id: ADMIN_USER_ID, username: 'admin', role: 'admin' })
    expect(response.body.data.password).toBeUndefined()
  })

  it('updates the admin password from the environment when seeded again', async () => {
    process.env.ADMIN_PASS = 'changed-password'
    try {
      await seedAdmin()
      const oldPassword = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin-password' })

      expect(oldPassword.status).toBe(401)
      await login('admin', 'changed-password')
    } finally {
      process.env.ADMIN_PASS = 'admin-password'
    }
  })

  it('answers a wrong password and an unknown user the same way', async () => {
    const wrongPassword = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'nope' })
    const unknownUser = await request(app).post('/api/auth/login').send({ username: 'ghost', password: 'nope' })
    const missing = await request(app).post('/api/auth/login').send({})

    expect(wrongPassword.status).toBe(401)
    expect(unknownUser.status).toBe(401)
    expect(unknownUser.body.error).toBe(wrongPassword.body.error)
    expect(missing.status).toBe(400)
  })

  it('blocks logins after 10 failed attempts, without counting successful ones', async () => {
    const limitedApp = express()
    registerMiddleware(limitedApp)
    registerRoutes(limitedApp)
    const attempt = (password: string) =>
      request(limitedApp).post('/api/auth/login').send({ username: 'admin', password })

    expect((await attempt('admin-password')).status).toBe(200)
    for (let i = 0; i < 10; i++) {
      expect((await attempt('wrong')).status).toBe(401)
    }
    const blocked = await attempt('admin-password')

    expect(blocked.status).toBe(429)
    expect(blocked.body.success).toBe(false)
    expect(blocked.body.error).toContain('Try again in')
    expect(blocked.body.retryAfter).toBeGreaterThanOrEqual(1)
    expect(blocked.body.retryAfter).toBeLessThanOrEqual(5 * 60)
    expect(blocked.headers['retry-after']).toBe(String(blocked.body.retryAfter))
  })

  it('stores only a hash of the session token', async () => {
    const token = await loginAdmin()

    const stored = await db.select({ tokenHash: sessions.tokenHash }).from(sessions)

    expect(stored).toEqual([{ tokenHash: hashToken(token) }])
  })

  it('sets the session cookie httpOnly and SameSite=Lax', async () => {
    const response = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin-password' })

    const cookie = String(response.headers['set-cookie'])
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
  })

  it('allows CORS only for exact frontend origins', async () => {
    const allowed = await request(app).get('/api/v1/users/me').set('Origin', 'http://localhost:8081')
    const lookalike = await request(app).get('/api/v1/users/me').set('Origin', 'http://localhost.evil.com')
    const foreign = await request(app).get('/api/v1/users/me').set('Origin', 'https://evil.example')

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:8081')
    expect(lookalike.headers['access-control-allow-origin']).toBeUndefined()
    expect(foreign.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('ends the session on logout with only a Bearer token', async () => {
    const token = await loginAdmin()

    const logout = await request(app).post('/api/auth/logout').set(bearer(token))
    const afterLogout = await request(app).get('/api/v1/users/me').set(bearer(token))

    expect(logout.status).toBe(200)
    expect(afterLogout.status).toBe(401)
  })

  it('accepts the session cookie and ends the session on cookie logout', async () => {
    const token = await loginAdmin()
    const cookie = `sessionToken=${token}`

    const me = await request(app).get('/api/v1/users/me').set('Cookie', cookie)
    await request(app).post('/api/auth/logout').set('Cookie', cookie)
    const afterLogout = await request(app).get('/api/v1/users/me').set('Cookie', cookie)

    expect(me.status).toBe(200)
    expect(afterLogout.status).toBe(401)
  })

  it('rejects expired sessions and removes them in cleanup', async () => {
    const payload = { id: ADMIN_USER_ID, username: 'admin', name: 'Admin', role: ROLE_VALUES.ADMIN }
    await sessionStore.set('expired-token', payload, -1000)
    await sessionStore.set('valid-token', payload)

    const response = await request(app).get('/api/v1/users/me').set(bearer('expired-token'))
    await sessionStore.deleteExpired()

    expect(response.status).toBe(401)
    expect(await db.select({ tokenHash: sessions.tokenHash }).from(sessions)).toEqual([
      { tokenHash: hashToken('valid-token') },
    ])
  })
})

describe('users', () => {
  it('never returns password hashes', async () => {
    const adminToken = await loginAdmin()
    const created = await createUser(adminToken, 'Jan')

    const list = await request(app).get('/api/v1/users').set(bearer(adminToken))
    const single = await request(app).get(`/api/v1/users/${created.id}`).set(bearer(adminToken))

    expect(created.username).toBe('jan')
    expect(created.password).toBeUndefined()
    expect(list.body.data.userCount).toBe(2)
    expect(JSON.stringify(list.body)).not.toContain('password')
    expect(JSON.stringify(single.body)).not.toContain('password')
  })

  it('lets a created user log in, and requires admin to create users', async () => {
    const adminToken = await loginAdmin()
    await createUser(adminToken, 'jan')
    const userToken = await login('jan', 'user-password')

    const response = await request(app)
      .post('/api/v1/users')
      .set(bearer(userToken))
      .send({ username: 'other', name: 'other', password: 'x' })

    expect(response.status).toBe(401)
  })

  it('rejects duplicate usernames on create and on update', async () => {
    const adminToken = await loginAdmin()
    await createUser(adminToken, 'jan')
    const other = await createUser(adminToken, 'other')

    const duplicateCreate = await request(app)
      .post('/api/v1/users')
      .set(bearer(adminToken))
      .send({ username: 'JAN', name: 'jan', password: 'x' })
    const duplicateUpdate = await request(app)
      .put(`/api/v1/users/${other.id}`)
      .set(bearer(adminToken))
      .send({ username: 'jan' })

    expect(duplicateCreate.status).toBe(400)
    expect(duplicateUpdate.status).toBe(400)
  })

  it('updates a username and deletes a user, ending their sessions', async () => {
    const adminToken = await loginAdmin()
    const user = await createUser(adminToken, 'jan')
    const userToken = await login('jan', 'user-password')

    const updated = await request(app)
      .put(`/api/v1/users/${user.id}`)
      .set(bearer(adminToken))
      .send({ username: 'Renamed' })
    const deleted = await request(app).delete(`/api/v1/users/${user.id}`).set(bearer(adminToken))
    const afterDelete = await request(app).get('/api/v1/users/me').set(bearer(userToken))

    expect(updated.body.data.username).toBe('renamed')
    expect(updated.body.data.password).toBeUndefined()
    expect(deleted.status).toBe(200)
    expect(afterDelete.status).toBe(401)
  })

  it("moves a deleted user's projects to the archive", async () => {
    const adminToken = await loginAdmin()
    const user = await createUser(adminToken, 'jan')
    const project = await createProject(await login('jan', 'user-password'))

    const deleted = await request(app).delete(`/api/v1/users/${user.id}`).set(bearer(adminToken))
    const archive = await request(app).get('/api/v1/projects/archive').set(bearer(adminToken))
    const adminProjects = await request(app).get('/api/v1/projects/user').set(bearer(adminToken))

    expect(deleted.status).toBe(200)
    expect(archive.body.data.projects).toHaveLength(1)
    expect(archive.body.data.projects[0]).toMatchObject({
      id: project.id,
      creatorId: ADMIN_USER_ID,
      archivedFrom: 'jan',
    })
    expect(adminProjects.body.data.projects).toHaveLength(0)
  })

  it('restores an archived project into the admin projects', async () => {
    const adminToken = await loginAdmin()
    const user = await createUser(adminToken, 'jan')
    const project = await createProject(await login('jan', 'user-password'))
    await request(app).delete(`/api/v1/users/${user.id}`).set(bearer(adminToken))

    const restored = await request(app).post(`/api/v1/projects/${project.id}/restore`).set(bearer(adminToken))
    const restoredAgain = await request(app).post(`/api/v1/projects/${project.id}/restore`).set(bearer(adminToken))
    const archive = await request(app).get('/api/v1/projects/archive').set(bearer(adminToken))
    const adminProjects = await request(app).get('/api/v1/projects/user').set(bearer(adminToken))

    expect(restored.status).toBe(200)
    expect(restored.body.data).toMatchObject({ archivedAt: null, archivedFrom: null })
    expect(restoredAgain.status).toBe(404)
    expect(archive.body.data.projects).toHaveLength(0)
    expect(adminProjects.body.data.projects.map((p: { id: number }) => p.id)).toEqual([project.id])
  })

  it('only lets the admin delete users and use the archive', async () => {
    const adminToken = await loginAdmin()
    const other = await createUser(adminToken, 'other')
    await createUser(adminToken, 'jan')
    const userToken = await login('jan', 'user-password')
    const project = await createProject(userToken)

    const deleted = await request(app).delete(`/api/v1/users/${other.id}`).set(bearer(userToken))
    const archive = await request(app).get('/api/v1/projects/archive').set(bearer(userToken))
    const restored = await request(app).post(`/api/v1/projects/${project.id}/restore`).set(bearer(userToken))

    expect(deleted.status).toBe(401)
    expect(archive.status).toBe(401)
    expect(restored.status).toBe(401)
  })

  it('protects the admin row from change and deletion', async () => {
    const adminToken = await loginAdmin()

    const deleted = await request(app).delete(`/api/v1/users/${ADMIN_USER_ID}`).set(bearer(adminToken))
    const updated = await request(app)
      .put(`/api/v1/users/${ADMIN_USER_ID}`)
      .set(bearer(adminToken))
      .send({ username: 'other' })

    expect(deleted.status).toBe(403)
    expect(updated.status).toBe(403)
  })
})

describe('users: access', () => {
  it('lets a user read and rename only themselves', async () => {
    const adminToken = await loginAdmin()
    const jan = await createUser(adminToken, 'jan')
    const other = await createUser(adminToken, 'other')
    const janToken = await login('jan', 'user-password')

    const readSelf = await request(app).get(`/api/v1/users/${jan.id}`).set(bearer(janToken))
    const readOther = await request(app).get(`/api/v1/users/${other.id}`).set(bearer(janToken))
    const renameOther = await request(app)
      .put(`/api/v1/users/${other.id}`)
      .set(bearer(janToken))
      .send({ username: 'hijacked' })
    const renameSelf = await request(app)
      .put(`/api/v1/users/${jan.id}`)
      .set(bearer(janToken))
      .send({ username: 'jan2' })
    const adminReadsOther = await request(app).get(`/api/v1/users/${other.id}`).set(bearer(adminToken))

    expect(readSelf.status).toBe(200)
    expect(readOther.status).toBe(403)
    expect(renameOther.status).toBe(403)
    expect(renameSelf.body.data.username).toBe('jan2')
    expect(adminReadsOther.status).toBe(200)
    expect(adminReadsOther.body.data.username).toBe('other')
  })

  it('rejects an update without a username', async () => {
    const adminToken = await loginAdmin()
    const jan = await createUser(adminToken, 'jan')

    const response = await request(app).put(`/api/v1/users/${jan.id}`).set(bearer(adminToken)).send({})

    expect(response.status).toBe(400)
  })
})

describe('projects: access', () => {
  it("hides other users' projects and boards, but not from the admin", async () => {
    const adminToken = await loginAdmin()
    await createUser(adminToken, 'jan')
    await createUser(adminToken, 'other')
    const janToken = await login('jan', 'user-password')
    const otherToken = await login('other', 'user-password')
    const project = await createProject(janToken)
    const board = await createBoard(janToken, project.id)
    const projectUrl = `/api/v1/projects/${project.id}`
    const boardUrl = `${projectUrl}/board/${board.id}`

    const responses = [
      await request(app).get(projectUrl).set(bearer(otherToken)),
      await request(app).put(projectUrl).set(bearer(otherToken)).send({ name: 'taken' }),
      await request(app).delete(projectUrl).set(bearer(otherToken)),
      await request(app).post(`${projectUrl}/board`).set(bearer(otherToken)),
      await request(app).get(boardUrl).set(bearer(otherToken)),
      await request(app).put(boardUrl).set(bearer(otherToken)).send({ name: 'taken' }),
      await request(app).delete(boardUrl).set(bearer(otherToken)),
    ]
    const ownerView = await request(app).get(projectUrl).set(bearer(janToken))
    const adminView = await request(app).get(boardUrl).set(bearer(adminToken))

    expect(responses.map((response) => response.status)).toEqual([404, 404, 404, 404, 404, 404, 404])
    expect(ownerView.body.data).toMatchObject({ name: '', components: [{ id: board.id }] })
    expect(adminView.status).toBe(200)
  })
})

describe('projects', () => {
  it('creates projects and boards with the confirmed name', async () => {
    const token = await loginAdmin()

    const project = await request(app).post('/api/v1/projects').set(bearer(token)).send({ name: '  Garden ' })
    const board = await request(app)
      .post(`/api/v1/projects/${project.body.data.id}/board`)
      .set(bearer(token))
      .send({ name: 'Sprint' })
    const invalidProject = await request(app).post('/api/v1/projects').set(bearer(token)).send({ name: 42 })
    const invalidBoard = await request(app)
      .post(`/api/v1/projects/${project.body.data.id}/board`)
      .set(bearer(token))
      .send({ name: 42 })

    expect(project.status).toBe(201)
    expect(project.body.data.name).toBe('Garden')
    expect(board.status).toBe(201)
    expect(board.body.data.name).toBe('Sprint')
    expect(invalidProject.status).toBe(400)
    expect(invalidBoard.status).toBe(400)
  })

  it("lets the admin list another user's projects by user ID", async () => {
    const adminToken = await loginAdmin()
    const jan = await createUser(adminToken, 'jan')
    const janToken = await login('jan', 'user-password')
    const first = await createProject(janToken)
    const second = await createProject(janToken)

    const response = await request(app).get(`/api/v1/projects/user/${jan.id}`).set(bearer(adminToken))

    expect(response.status).toBe(200)
    expect(response.body.data.projectCount).toBe(2)
    expect(response.body.data.projects.map((project: { id: number }) => project.id)).toEqual([first.id, second.id])
  })

  it('lets a user list their own projects by user ID, but not anyone else', async () => {
    const adminToken = await loginAdmin()
    const jan = await createUser(adminToken, 'jan')
    const other = await createUser(adminToken, 'other')
    const janToken = await login('jan', 'user-password')
    await createProject(janToken)

    const own = await request(app).get(`/api/v1/projects/user/${jan.id}`).set(bearer(janToken))
    const others = await request(app).get(`/api/v1/projects/user/${other.id}`).set(bearer(janToken))
    const admins = await request(app).get(`/api/v1/projects/user/${ADMIN_USER_ID}`).set(bearer(janToken))

    expect(own.status).toBe(200)
    expect(own.body.data.projectCount).toBe(1)
    expect(others.status).toBe(403)
    expect(admins.status).toBe(403)
  })

  it('returns 404 when the admin asks for an unknown user', async () => {
    const adminToken = await loginAdmin()

    const response = await request(app).get('/api/v1/projects/user/999999').set(bearer(adminToken))

    expect(response.status).toBe(404)
  })

  it('creates a project for the admin and lists it in creation order', async () => {
    const token = await loginAdmin()
    const first = await createProject(token)
    const second = await createProject(token)

    await request(app).put(`/api/v1/projects/${first.id}`).set(bearer(token)).send({ name: 'Moved?' })
    const response = await request(app).get('/api/v1/projects/user').set(bearer(token))

    expect(first).toMatchObject({ name: '', creatorId: ADMIN_USER_ID, components: [] })
    expect(response.body.data.projectCount).toBe(2)
    expect(response.body.data.projects.map((project: { id: number }) => project.id)).toEqual([first.id, second.id])
  })

  it('only lists the current user’s projects', async () => {
    const adminToken = await loginAdmin()
    await createProject(adminToken)
    await createUser(adminToken, 'jan')

    const response = await request(app)
      .get('/api/v1/projects/user')
      .set(bearer(await login('jan', 'user-password')))

    expect(response.body.data).toEqual({ projectCount: 0, projects: [] })
  })

  it('renames a project without touching its boards', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const board = await createBoard(token, project.id)

    const response = await request(app).put(`/api/v1/projects/${project.id}`).set(bearer(token)).send({ name: 'New' })

    expect(response.status).toBe(200)
    expect(response.body.data.name).toBe('New')
    expect(response.body.data.components).toEqual([board])
  })

  it('rejects invalid project data', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)

    const response = await request(app)
      .put(`/api/v1/projects/${project.id}`)
      .set(bearer(token))
      .send({ components: [{ type: 'unknown' }] })

    expect(response.status).toBe(400)
  })

  it('deletes a project', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)

    const deleted = await request(app).delete(`/api/v1/projects/${project.id}`).set(bearer(token))
    const afterDelete = await request(app).get(`/api/v1/projects/${project.id}`).set(bearer(token))

    expect(deleted.status).toBe(200)
    expect(afterDelete.status).toBe(404)
  })

  it.each(['not-a-number', '1.5', '99999999999'])('returns 404 for the impossible ID %s', async (id) => {
    const token = await loginAdmin()

    const project = await request(app).get(`/api/v1/projects/${id}`).set(bearer(token))
    const board = await request(app).get(`/api/v1/projects/${id}/board/1`).set(bearer(token))
    const user = await request(app).get(`/api/v1/users/${id}`).set(bearer(token))

    expect([project.status, board.status, user.status]).toEqual([404, 404, 404])
  })

  it('requires authentication', async () => {
    const response = await request(app).get('/api/v1/projects/user')

    expect(response.status).toBe(401)
  })
})

describe('boards', () => {
  const boardContent = (creatorId: number) => ({
    name: 'Sprint',
    creatorId,
    members: [],
    settings: {
      cards: { priority: true, description: false, checklist: false },
      modal: { priority: true, description: true, checklist: true },
    },
    columns: [
      {
        id: generateId(),
        name: 'To do',
        cards: [
          {
            id: generateId(),
            name: 'Card',
            priority: 'High',
            description: 'Text',
            checklist: [{ isChecked: true, label: 'Step' }],
            startDate: '2026-11-06T10:00:00.000Z',
            deadline: '2026-11-07T10:00:00.000Z',
            tags: [{ label: 'Tag', color: '#ff0000' }],
          },
        ],
      },
    ],
  })

  it('creates a board with default content', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)

    const board = await createBoard(token, project.id)
    const response = await request(app).get(`/api/v1/projects/${project.id}/board/${board.id}`).set(bearer(token))

    expect(board).toMatchObject({ type: 'board', name: '', creatorId: ADMIN_USER_ID, columns: [] })
    expect(response.body.data).toEqual(board)
  })

  it('saves and reloads whole-board content, keeping column and card order and dates', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const board = await createBoard(token, project.id)
    const content = boardContent(ADMIN_USER_ID)

    const saved = await request(app)
      .put(`/api/v1/projects/${project.id}/board/${board.id}`)
      .set(bearer(token))
      .send({ boardData: { ...content, id: 999, type: 'other' } })
    const reloaded = await request(app).get(`/api/v1/projects/${project.id}/board/${board.id}`).set(bearer(token))

    expect(saved.status).toBe(200)
    expect(reloaded.body.data).toEqual({ ...content, id: board.id, type: 'board' })
  })

  it('rejects board content that breaks the schema and keeps the old content', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const board = await createBoard(token, project.id)
    const content = boardContent(ADMIN_USER_ID)
    content.columns[0].cards[0].priority = 'Urgent'

    const response = await request(app)
      .put(`/api/v1/projects/${project.id}/board/${board.id}`)
      .set(bearer(token))
      .send({ boardData: content })
    const reloaded = await request(app).get(`/api/v1/projects/${project.id}/board/${board.id}`).set(bearer(token))

    expect(response.status).toBe(400)
    expect(reloaded.body.data).toEqual(board)
  })

  it('renames a board and requires a name or board data', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const board = await createBoard(token, project.id)
    const path = `/api/v1/projects/${project.id}/board/${board.id}`

    const renamed = await request(app).put(path).set(bearer(token)).send({ name: 'Renamed' })
    const empty = await request(app).put(path).set(bearer(token)).send({})
    const reloaded = await request(app).get(path).set(bearer(token))

    expect(renamed.body.data).toEqual({ name: 'Renamed' })
    expect(empty.status).toBe(400)
    expect(reloaded.body.data.name).toBe('Renamed')
  })

  it('deletes only the requested board', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const removed = await createBoard(token, project.id)
    const kept = await createBoard(token, project.id)

    const response = await request(app).delete(`/api/v1/projects/${project.id}/board/${removed.id}`).set(bearer(token))
    const reloaded = await request(app).get(`/api/v1/projects/${project.id}`).set(bearer(token))

    expect(response.status).toBe(200)
    expect(reloaded.body.data.components).toEqual([kept])
  })

  it('returns 404 for a missing project or board', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)
    const missingBoard = `/api/v1/projects/${project.id}/board/123`
    const missingProject = '/api/v1/projects/123/board/123'
    const boardData = boardContent(ADMIN_USER_ID)

    const responses = await Promise.all([
      request(app).get(missingBoard).set(bearer(token)),
      request(app).delete(missingBoard).set(bearer(token)),
      request(app).put(missingBoard).set(bearer(token)).send({ name: 'x' }),
      request(app).put(missingBoard).set(bearer(token)).send({ boardData }),
      request(app).get(missingProject).set(bearer(token)),
      request(app).delete(missingProject).set(bearer(token)),
      request(app).put(missingProject).set(bearer(token)).send({ name: 'x' }),
      request(app).put(missingProject).set(bearer(token)).send({ boardData }),
      request(app).post('/api/v1/projects/123/board').set(bearer(token)),
    ])

    expect(responses.map((response) => response.status)).toEqual(Array(9).fill(404))
  })

  it('keeps every board when several are created at once', async () => {
    const token = await loginAdmin()
    const project = await createProject(token)

    await Promise.all(Array.from({ length: 5 }, () => createBoard(token, project.id)))
    const reloaded = await request(app).get(`/api/v1/projects/${project.id}`).set(bearer(token))

    expect(reloaded.body.data.components).toHaveLength(5)
  })
})
