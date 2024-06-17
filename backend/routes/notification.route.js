import express from 'express'
import { authProtect } from '../middlewares/authProtect.js'
import { getNotifications, deleteNotification } from '../controllers/notification.controller.js'

const router = express.Router()


router.get('/', authProtect, getNotifications)
router.delete('/', authProtect, deleteNotification)

export default router