import express from "express"

import cors from "cors"

const app=express()

app.use(cors())
app.use(express.json())
const PORT=8080



const user_list=[]


app.get("/user",(req,res)=>{
    res.json(user_list)
})


app.post("/user",(req,res)=>{
    const {id,title,price,image}=req.body

    user_list.push({id,title,price,image})

    res.send("created new user")
})




app.listen(PORT,()=>console.log(`http://localhost:${PORT}/`))