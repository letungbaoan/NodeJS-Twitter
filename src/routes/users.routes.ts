import { Router } from 'express'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
import { wrapResquestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapResquestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapResquestHandler(registerController))
export default usersRouter
