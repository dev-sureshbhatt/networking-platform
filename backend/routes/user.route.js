import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { getUserProfile, followUnfollowProfiles, getSuggestedUser, updateProfile } from '../controllers/user.controller.js'

const router = express.Router()


router.get('/profile/:username', authProtect, getUserProfile)
router.put('/follow/:id', authProtect, followUnfollowProfiles)
router.get('/suggested', authProtect, getSuggestedUser)
router.put('/update', authProtect, updateProfile)


export default router