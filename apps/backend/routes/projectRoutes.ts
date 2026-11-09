import express from 'express'
import {
  createProject,
  getAllProjectsByUser,
  getProjectsByUserId,
  getArchivedProjects,
  restoreArchivedProject,
  getProjectById,
  deleteProjectById,
  updateProjectById,
} from '../controllers/projectController.js'

import { adminMiddleware } from '../middleware/authMiddleware.js'
import { createBoardComponent, getBoardById, deleteBoardById, updateBoardById } from '../controllers/boardController.js'

const router = express.Router()

router.post('/', createProject)
router.get('/user', getAllProjectsByUser)
router.get('/user/:userId', getProjectsByUserId)
router.get('/archive', adminMiddleware, getArchivedProjects)
router.post('/:projectId/restore', adminMiddleware, restoreArchivedProject)

router.post('/:projectId/board', createBoardComponent)
router.get('/:projectId/board/:boardId', getBoardById)
router.delete('/:projectId/board/:boardId', deleteBoardById)
router.put('/:projectId/board/:boardId', updateBoardById)

router.get('/:projectId', getProjectById)
router.delete('/:projectId', deleteProjectById)
router.put('/:projectId', updateProjectById)

export default router
