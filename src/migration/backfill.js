const couchDb = require('../db/couchdb')
const postgres = require('../db/postgres')

async function backfillBooks() {
  const docs = await couchDb.getAllBooksWithDocs()
  for (const doc of docs) {
    if (doc.type !== 'book') {
      continue
    }
    await postgres.upsertBook(doc)
  }
  return docs.length
}

module.exports = {
  backfillBooks
}
