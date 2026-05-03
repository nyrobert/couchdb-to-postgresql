const express = require('express')
const config = require('./config')
const couchDb = require('./db/couchdb')
const postgres = require('./db/postgres')
const booksRouter = require('./routes/books')
const migrationRouter = require('./routes/migration')
const cdc = require('./migration/cdc')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', migrationStrategy: config.migrationStrategy })
})
app.use('/books', booksRouter)
app.use('/migration', migrationRouter)

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
})

async function start() {
  await couchDb.initCouchDb()
  await postgres.initPostgres()

  if (config.migrationStrategy === 'cdc') {
    console.log('Starting CouchDB CDC listener...')
    cdc.runCdcLoop(config.cdcSince).catch((error) => {
      console.error('CDC loop exited unexpectedly', error)
    })
  }

  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`)
    console.log(`Migration strategy: ${config.migrationStrategy}`)
  })
}

start().catch((error) => {
  console.error('Failed to start application', error)
  process.exit(1)
})

module.exports = app
