import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import product from "./model/product.js"
import category from "./model/category.js"


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

// Delete a product by ID

app.delete("/api/products/:id", async (req, res) => {
try {
    const { id } = req.params;
    const deleteProduct = await product.findByIdAndDelete(id);
    
    if (!deleteProduct) {
        return res.status(404).json({message: "product not found." });
    }
    res.status(200).json({
        message:"product deleted successfully",
        product: deleteProduct,
    });
}catch (error) {
    console.error(error);
    res.status(500).json({ message: "serve error"});
}
});


app.post("/user",(req,res)=>{
    const {id,title,price,image}=req.body

     product.create({title:title,price:price,image:image})


    res.send("created new user")
})



  app.get("/category",async(req,res)=>{
    let categories=await category.find()
    res.json(categories)
  })
 
    
// Delete a product by ID

app.delete("/api/category/:id", async (req, res) => {
try {
    const { id } = req.params;
    const deletecategory = await category.findByIdAndDelete(id);
    
    if (!deletecategory) {
        return res.status(404).json({message: "product not found." });
    }
    res.status(200).json({
        message:"product deleted successfully",
        product: deletecategory,
    });
}catch (error) {
    console.error(error);
    res.status(500).json({ message: "serve error"});
}
});

 app.post("/category", async (req, res) => {
  try {
    const categ = await category.create(req.body);
    res.status(201).json({ product: categ }); // ✅ Correct JSON response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 



app.listen(PORT,()=>console.log(`http://localhost:${PORT}/`))