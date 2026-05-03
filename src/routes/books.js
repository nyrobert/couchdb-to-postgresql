const express = require('express')
const bookService = require('../services/bookService')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const books = await bookService.listBooks()
    res.json(books)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const book = await bookService.getBook(req.params.id)
    res.json(book)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body)
    res.status(201).json(book)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body)
    res.json(book)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

module.exports = router
