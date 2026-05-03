const config = require('../config')
const couchDb = require('../db/couchdb')
const postgres = require('../db/postgres')

let stopped = false

function normalizeDoc(doc) {
  return doc
}

async function processChanges(changes) {
  if (!changes.results || !changes.results.length) {
    return
  }

  for (const change of changes.results) {
    if (change.deleted) {
      await postgres.deleteBook(change.id)
      continue
    }
    if (change.doc && change.doc.type === 'book') {
      await postgres.upsertBook(change.doc)
    }
  }
}

async function runCdcLoop(startSeq) {
  let since = startSeq
  while (!stopped) {
    try {
      const changes = await couchDb.getChanges(since, () => {})
      if (changes.results && changes.results.length) {
        await processChanges(changes)
      }
      since = changes.last_seq || since
    } catch (error) {
      console.error('CDC listener error:', error.message || error)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

function stop() {
  stopped = true
}

module.exports = {
  runCdcLoop,
  stop
}
