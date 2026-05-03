const required = (name, fallback) => {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  couchDbUrl: required('COUCHDB_URL', 'http://admin:password@couchdb:5984'),
  couchDbName: process.env.COUCHDB_DB || 'books',
  postgresUrl: required('POSTGRES_URL', 'postgresql://postgres:password@postgres:5432/postgres'),
  migrationStrategy: (process.env.MIGRATION_STRATEGY || 'dualwrite').toLowerCase(),
  cdcSince: process.env.CDC_SINCE || 'now',
  enableBackfillEndpoint: process.env.ENABLE_BACKFILL_ENDPOINT !== 'false'
}
