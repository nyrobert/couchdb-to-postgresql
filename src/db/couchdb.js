const Nano = require('nano')
const config = require('../config')

let db

async function initCouchDb() {
  const client = Nano(config.couchDbUrl)
  try {
    await client.db.create(config.couchDbName)
  } catch (error) {
    if (error.statusCode !== 412) {
      throw error
    }
  }
  db = client.db.use(config.couchDbName)
  return db
}

function sanitizeBookDoc(doc) {
  return {
    id: doc._id,
    rev: doc._rev,
    title: doc.title,
    author: doc.author,
    publishedDate: doc.publishedDate,
    summary: doc.summary,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

async function createBook(payload) {
  const now = new Date().toISOString()
  const doc = {
    type: 'book',
    title: payload.title,
    author: payload.author,
    publishedDate: payload.publishedDate || null,
    summary: payload.summary || null,
    createdAt: now,
    updatedAt: now
  }
  const result = await db.insert(doc)
  return sanitizeBookDoc({ ...doc, _id: result.id, _rev: result.rev })
}

async function listBooks() {
  const response = await db.find({ selector: { type: 'book' }, sort: [{ createdAt: 'asc' }] })
  return response.docs.map(sanitizeBookDoc)
}

async function getBook(id) {
  const doc = await db.get(id)
  return sanitizeBookDoc(doc)
}

async function updateBook(id, updates) {
  const existing = await db.get(id)
  const now = new Date().toISOString()
  const merged = {
    ...existing,
    title: updates.title ?? existing.title,
    author: updates.author ?? existing.author,
    publishedDate: updates.publishedDate ?? existing.publishedDate,
    summary: updates.summary ?? existing.summary,
    updatedAt: now
  }
  const result = await db.insert(merged)
  return sanitizeBookDoc({ ...merged, _rev: result.rev })
}

async function deleteBook(id) {
  const existing = await db.get(id)
  return db.destroy(id, existing._rev)
}

async function getAllBooksWithDocs() {
  const response = await db.find({ selector: { type: 'book' } })
  return response.docs
}

async function getChanges(since, callback) {
  const url = new URL(`/${config.couchDbName}/_changes`, config.couchDbUrl)
  url.searchParams.set('feed', 'longpoll')
  url.searchParams.set('include_docs', 'true')
  url.searchParams.set('since', since)
  url.searchParams.set('heartbeat', '30000')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`CouchDB changes feed request failed: ${res.status}`)
  }
  const data = await res.json()
  callback(data)
  return data.last_seq
}

module.exports = {
  initCouchDb,
  createBook,
  listBooks,
  getBook,
  updateBook,
  deleteBook,
  getAllBooksWithDocs,
  getChanges
}
