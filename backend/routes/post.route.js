import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { createPost, deletePost, commentOnPost } from '../controllers/post.controller.js'

const router = express.Router()

router.post('/create', authProtect, createPost)
router.delete('/:id', authProtect, deletePost)
router.put('/comment/:id', authProtect, commentOnPost)

export default router