const express = require('express')
const config = require('../config')
const { backfillBooks } = require('../migration/backfill')

const router = express.Router()

router.get('/status', (req, res) => {
  res.json({ strategy: config.migrationStrategy, backfillEndpoint: config.enableBackfillEndpoint })
})

router.post('/backfill', async (req, res, next) => {
  if (!config.enableBackfillEndpoint) {
    return res.status(403).json({ error: 'Backfill endpoint disabled' })
  }
  try {
    const count = await backfillBooks()
    res.json({ migrated: count })
  } catch (error) {
    next(error)
  }
})

module.exports = router
