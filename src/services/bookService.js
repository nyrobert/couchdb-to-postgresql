const config = require('../config')
const couchDb = require('../db/couchdb')
const postgres = require('../db/postgres')

async function listBooks() {
  return couchDb.listBooks()
}

async function getBook(id) {
  return couchDb.getBook(id)
}

async function createBook(payload) {
  const book = await couchDb.createBook(payload)
  if (config.migrationStrategy === 'dualwrite') {
    await postgres.upsertBook({ ...book, _id: book.id, _rev: book.rev })
  }
  return book
}

async function updateBook(id, payload) {
  const book = await couchDb.updateBook(id, payload)
  if (config.migrationStrategy === 'dualwrite') {
    await postgres.upsertBook({ ...book, _id: book.id, _rev: book.rev })
  }
  return book
}

async function deleteBook(id) {
  const result = await couchDb.deleteBook(id)
  if (config.migrationStrategy === 'dualwrite') {
    await postgres.deleteBook(id)
  }
  return result
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
}
