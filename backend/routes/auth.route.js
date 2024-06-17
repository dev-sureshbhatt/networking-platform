import express from 'express'
import { getMe, login, logout, signup } from '../controllers/auth.controller.js'
import { authProtect } from '../middlewares/authProtect.js'


const router = express.Router()

router.get('/me', authProtect, getMe)
router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)

export default router