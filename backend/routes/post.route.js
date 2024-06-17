import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { createPost } from '../controllers/post.controller.js'

const router = express.Router()

router.post('/create', authProtect, createPost)

export default router