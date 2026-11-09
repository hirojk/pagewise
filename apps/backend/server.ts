import './config/env.js'
import express from 'express'
import { registerMiddleware } from './config/middleware.js'
import { registerRoutes } from './config/routes.js'
import { startLocalServer } from './config/localServer.js'

const app: express.Application = express()

registerMiddleware(app)
registerRoutes(app)

startLocalServer(app)
export default app
