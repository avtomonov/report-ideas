import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const redisKey = 'report_likes'
const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken
    })
  : null

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

const requireRedis = () => {
  if (!redis) {
    throw createHttpError(
      503,
      'Likes storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    )
  }

  return redis
}

const getAllLikes = async () => {
  const client = requireRedis()
  const rawLikes = await client.hgetall(redisKey)
  const likes = {}

  for (const [key, rawValue] of Object.entries(rawLikes || {})) {
    const value = Number(rawValue)
    likes[key] = Number.isFinite(value) ? value : 0
  }

  return likes
}

const incrementLike = async (reportId, delta) => {
  const client = requireRedis()
  const value = Number(await client.hincrby(redisKey, reportId, delta))
  return Number.isFinite(value) ? value : 0
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const likes = await getAllLikes()
      sendJson(res, 200, {
        likes,
        storage: 'upstash-redis'
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

      if (!Number.isFinite(delta)) {
        sendJson(res, 400, { error: 'delta must be a number' })
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