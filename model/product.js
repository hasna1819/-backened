import mongoose from "mongoose";





const productSchema=new mongoose.Schema({
    title:String,
    price:Number,
    image:String,
    description:String,
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true
    }

})

const product=mongoose.model("product",productSchema)

export default product