import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createAuthRouter } from '../routes/authRoutes.js'
import userRoutes from '../routes/userRoutes.js'
import projectRoutes from '../routes/projectRoutes.js'
import healthRoutes from '../routes/healthRoutes.js'

export const registerRoutes = (app: express.Application): void => {
  app.use('/api/health', healthRoutes)
  app.use('/api/auth', createAuthRouter())
  app.use('/api/v1/users', authMiddleware, userRoutes)
  app.use('/api/v1/projects', authMiddleware, projectRoutes)
}
