import express from 'express'
import {
  createUser,
  getAllUsers,
  getMe,
  getUserById,
  deleteUserById,
  updateUserById,
} from '../controllers/userController.js'
import { adminMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', adminMiddleware, createUser)
router.get('/', adminMiddleware, getAllUsers)
router.get('/me', getMe)
router.get('/:id', getUserById)
router.delete('/:id', adminMiddleware, deleteUserById)
router.put('/:id', updateUserById)

export default router
