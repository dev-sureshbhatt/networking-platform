import express from "express"
import dotenv from "dotenv"
import {v2 as cloudinary} from 'cloudinary'

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.route.js'
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"

dotenv.config()

//Configuring Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)



app.listen(PORT, ()=>{
    console.log(`Server is up and running on PORT: ${PORT}`)
    connectMongoDB()
})


