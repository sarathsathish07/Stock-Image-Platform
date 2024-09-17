import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
import { notFound,errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
const port = process.env.PORT || 5000
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import path from "path";
import { fileURLToPath } from 'url';

connectDB()

const app=express()

app.use(cors({
  origin: ['https://stock-image-platform.vercel.app',"http://localhost:3000"],
  credentials: true, 
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users',userRoutes)

app.get('/',(req,res)=>res.send('Server is ready'))
app.use(notFound)
app.use(errorHandler)

app.listen(port,()=>console.log("server started"))