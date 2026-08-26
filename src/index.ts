import express from 'express'
import cors from 'cors'
import envData from './app/config'
import mongoose from 'mongoose'
import { router } from './app/router'
import { globalErrorHandler } from './app/middleware/globalError'
import { notFound } from './app/middleware/notFound'
import http from 'http'
import { initializeSocket } from './app/socket'
 


const app = express()
const server = http.createServer(app)
initializeSocket(server)

app.use(cors(
  {
    origin: ['http://localhost:3000','https://geo-rider.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1', router)

app.use(notFound)
app.use(globalErrorHandler)



async function main() {
  await mongoose.connect(envData.databaseUrl);

  server.listen(envData.port, () => {
    console.log(`Server is running on port ${envData.port}`)
  })

}

main().catch(console.error);




