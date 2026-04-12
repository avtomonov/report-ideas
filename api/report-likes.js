const memoryStore = globalThis.__reportLikesStore || {}
globalThis.__reportLikesStore = memoryStore

const kvUrl = process.env.KV_REST_API_URL
const kvToken = process.env.KV_REST_API_TOKEN
const kvKey = 'report_likes'

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
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

const fetchKv = async (commandParts) => {
  if (!kvUrl || !kvToken) {
    return null
  }

  const endpoint = `${kvUrl}/${commandParts.join('/')}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`KV request failed: ${response.status}`)
  }

  return response.json()
}

const getAllLikes = async () => {
  if (!kvUrl || !kvToken) {
    return { ...memoryStore }
  }

  const payload = await fetchKv(['hgetall', kvKey])
  const list = payload?.result || []
  const likes = {}

  for (let i = 0; i < list.length; i += 2) {
    const key = list[i]
    const value = Number(list[i + 1])
    likes[key] = Number.isFinite(value) ? value : 0
  }

  return likes
}

const incrementLike = async (reportId, delta) => {
  if (!kvUrl || !kvToken) {
    const current = Number(memoryStore[reportId] || 0)
    const next = current + delta
    memoryStore[reportId] = next
    return next
  }

  const payload = await fetchKv(['hincrby', kvKey, reportId, String(delta)])
  const value = Number(payload?.result)
  return Number.isFinite(value) ? value : 0
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const likes = await getAllLikes()
      sendJson(res, 200, { likes })
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
    sendJson(res, 500, {
      error: 'Unexpected server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}