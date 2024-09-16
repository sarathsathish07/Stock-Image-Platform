import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { notFound,errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
const port = process.env.PORT || 5000
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'

connectDB()

const app=express()
const allowedOrigins = ['https://stock-image-platform.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())
app.use(express.static('backend/public'));

app.use('/api/users',userRoutes)

app.get('/',(req,res)=>res.send('Server is ready'))
app.use(notFound)
app.use(errorHandler)

app.listen(port,()=>console.log("server started"))