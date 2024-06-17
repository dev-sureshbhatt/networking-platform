import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { getAllPosts, createPost, deletePost, commentOnPost, likeUnlikePost } from '../controllers/post.controller.js'

const router = express.Router()

router.get('/all', authProtect, getAllPosts)
router.post('/create', authProtect, createPost)
router.delete('/:id', authProtect, deletePost)
router.put('/comment/:id', authProtect, commentOnPost)
router.put('/like/:id', authProtect, likeUnlikePost)

export default router