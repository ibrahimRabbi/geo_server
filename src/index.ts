import express from 'express'
import cors from 'cors'
import envData from './app/config'
import mongoose from 'mongoose'
import { router } from './app/router'
import { globalErrorHandler } from './app/middleware/globalError'
import { notFound } from './app/middleware/notFound'


const app = express()

app.use(cors(
  {
    origin: ['http://localhost:3000'],
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
  console.log('✅ Database connected successfully');


  app.listen(envData.port, () => {
    console.log(`Server is running on port ${envData.port}`)
  })

}

main().catch(console.error);




