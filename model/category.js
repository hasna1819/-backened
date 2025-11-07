import mongoose from "mongoose";





const CategorySchema=new mongoose.Schema({
    title:String,
    image:String
})

const category=mongoose.model("category",CategorySchema)

export default category