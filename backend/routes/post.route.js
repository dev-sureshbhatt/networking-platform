import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { createPost, deletePost } from '../controllers/post.controller.js'

const router = express.Router()

router.post('/create', authProtect, createPost)
router.delete('/:id', authProtect, deletePost)

export default router