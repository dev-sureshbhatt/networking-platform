import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { getAllPosts, getLikedPosts, getFollowingPosts, createPost, deletePost, commentOnPost, likeUnlikePost, getUserPosts } from '../controllers/post.controller.js'

const router = express.Router()

router.get('/all', authProtect, getAllPosts)
router.get('/liked/:id', authProtect, getLikedPosts)
router.get('/following', authProtect, getFollowingPosts)
router.get('/user/:username', authProtect, getUserPosts)
router.post('/create', authProtect, createPost)
router.delete('/:id', authProtect, deletePost)
router.put('/comment/:id', authProtect, commentOnPost)
router.put('/like/:id', authProtect, likeUnlikePost)

export default router