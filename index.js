import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import product from "./model/product.js"

const app=express()
app.use(cors())
app.use(express.json())
const PORT=8080

mongoose.connect(process.env.MONGO_DB).then(()=>console.log("DATABASE CONNECTED"))

const user_list=[]


app.get("/user",async(req,res)=>{
    let product_list=await product.find()
    res.json(product_list)
})


app.post("/user",(req,res)=>{
    const {id,title,price,image}=req.body

     product.create({title:title,price:price,image:image})


    res.send("created new user")
})




app.listen(PORT,()=>console.log(`http://localhost:${PORT}/`))