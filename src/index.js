// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})





connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !! ", err);
})







//whenever connects Db -> always use try catch, async await 
// DB is always in other continent - always use async await
// try to use IIFE function (()=>{})()


/*
import mongoose from "mongoose";
import {DB_NAME} from './constants';
import express from 'express';
const app = express()

// function connectDB(){}
// connectDB();
// better approach than this -> using IIFE(immediately invoked function execution) (callback function)()
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })






    } catch (error) {
        console.error("ERROR: ", error)
        throw error;    
    }
})()
*/