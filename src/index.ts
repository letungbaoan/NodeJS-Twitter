import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middewares'
import mediasRouter from './routes/medias.routes'
import { initTempFolder } from './utils/file'
const app = express()
const port = 4000
databaseService.connect()
initTempFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
