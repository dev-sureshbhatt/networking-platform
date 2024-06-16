import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { getUserProfile, followUnfollowProfiles } from '../controllers/user.controller.js'

const router = express.Router()


router.get('/profile/:username', authProtect, getUserProfile)
router.post('/follow/:id', authProtect, followUnfollowProfiles )
// router.get('/profile/:username', getUserProfile)


export default router