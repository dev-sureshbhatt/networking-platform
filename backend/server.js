import express from "express"
import dotenv from "dotenv"

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.route.js'
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"

dotenv.config()


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


