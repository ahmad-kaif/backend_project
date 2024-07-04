import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express( )

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // app.use is used for middlewares and cors

app.use(express.json({limit: "16kb"})) //if someone is sharing json 
app.use(express.urlencoded({extended: true, limit: "16kb"})) // for url sharing
app.use(express.static("public")) // for extra things like photo etc gets stored in local file public
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
// app.use("/users", userRouter)
app.use("/api/v1/users", userRouter)

// https://localhost:800/api/v1/users/register

export { app }  