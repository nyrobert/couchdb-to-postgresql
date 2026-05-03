const { Pool } = require('pg')
const config = require('../config')

const pool = new Pool({ connectionString: config.postgresUrl })

async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      published_date TEXT,
      summary TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      couch_rev TEXT
    )
  `)
}

function normalizeCouchBook(doc) {
  return {
    id: doc._id,
    title: doc.title || null,
    author: doc.author || null,
    published_date: doc.publishedDate || null,
    summary: doc.summary || null,
    created_at: doc.createdAt ? new Date(doc.createdAt) : null,
    updated_at: doc.updatedAt ? new Date(doc.updatedAt) : null,
    couch_rev: doc._rev || null
  }
}

async function upsertBook(doc) {
  const book = normalizeCouchBook(doc)
  await pool.query(
    `INSERT INTO books (id, title, author, published_date, summary, created_at, updated_at, couch_rev)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       author = EXCLUDED.author,
       published_date = EXCLUDED.published_date,
       summary = EXCLUDED.summary,
       created_at = EXCLUDED.created_at,
       updated_at = EXCLUDED.updated_at,
       couch_rev = EXCLUDED.couch_rev`,
    [book.id, book.title, book.author, book.published_date, book.summary, book.created_at, book.updated_at, book.couch_rev]
  )
}

async function deleteBook(id) {
  await pool.query('DELETE FROM books WHERE id = $1', [id])
}

module.exports = {
  initPostgres,
  upsertBook,
  deleteBook
}
