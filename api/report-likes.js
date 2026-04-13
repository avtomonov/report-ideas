import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
const sql = databaseUrl ? neon(databaseUrl) : null
let ensureSchemaPromise = null

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

const requireDatabase = () => {
  if (!sql) {
    throw createHttpError(
      503,
      'Likes storage is not configured. Set DATABASE_URL in Vercel project settings.'
    )
  }

  return sql
}

const ensureSchema = async () => {
  if (!ensureSchemaPromise) {
    const db = requireDatabase()
    ensureSchemaPromise = db`
      CREATE TABLE IF NOT EXISTS report_likes (
        report_id TEXT PRIMARY KEY,
        like_count INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
  }

  await ensureSchemaPromise
}

const getAllLikes = async () => {
  const db = requireDatabase()
  await ensureSchema()
  const rows = await db`SELECT report_id, like_count FROM report_likes`
  const likes = {}

  for (const row of rows) {
    const value = Number(row.like_count)
    likes[row.report_id] = Number.isFinite(value) ? value : 0
  }

  return likes
}

const incrementLike = async (reportId, delta) => {
  const db = requireDatabase()
  await ensureSchema()
  const rows = await db`
    INSERT INTO report_likes (report_id, like_count)
    VALUES (${reportId}, ${delta})
    ON CONFLICT (report_id)
    DO UPDATE SET
      like_count = report_likes.like_count + ${delta},
      updated_at = NOW()
    RETURNING like_count
  `
  const value = Number(rows[0]?.like_count)
  return Number.isFinite(value) ? value : 0
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const likes = await getAllLikes()
      sendJson(res, 200, {
        likes,
        storage: 'neon-postgres'
      })
      return
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const reportId = String(body.reportId || '').trim()
      const delta = Number(body.delta || 1)

      if (!reportId) {
        sendJson(res, 400, { error: 'reportId is required' })
        return
      }

      if (!Number.isInteger(delta)) {
        sendJson(res, 400, { error: 'delta must be an integer' })
        return
      }

      const likeCount = await incrementLike(reportId, delta)
      sendJson(res, 200, { reportId, likeCount })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.statusCode ? 'Likes backend error' : 'Unexpected server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}