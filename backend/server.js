import express from "express"
import dotenv from "dotenv"
import {v2 as cloudinary} from 'cloudinary'
import path from 'path'

import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import notificationRouter  from './routes/notification.route.js'
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"
// import cors from 'cors'

dotenv.config()

//Configuring Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const app = express()
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve()

app.use(express.json({limit: '4mb'})) // for image files, we need to still verify if this is secure or not
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
// app.use(cors({credentials: true ,origin: "http://localhost:5173"}))




app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/notifications', notificationRouter)




if (process.env.NODE_ENV === "production"){
    
    app.use(express.static(path.join(__dirname, '/client/dist')));
    app.get("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
    })
}



app.listen(PORT, ()=>{
    console.log(`Server is up and running on PORT: ${PORT}`)
    connectMongoDB()
})


