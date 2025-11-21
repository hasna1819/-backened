import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import product from "./model/product.js";
import category from "./model/category.js";

import { upload } from "./multer.js";

dotenv.config();

const app = express();
const PORT = 8080;

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ============================================================
// 🟩 PRODUCT ROUTES
// ============================================================


app.use("/uploads", express.static("uploads"));


// Get all products
app.get("/user", async (req, res) => {
  try {
    const productList = await product.find();
    res.json(productList);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new product
app.post("/user",upload.single("image"), async (req, res) => {
  try {
    const { title, price, image,category,description } = req.body;

    const newProduct = await product.create({ title, price, image,category,description });


    res.status(201).json({ product: newProduct });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product by ID
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🟦 CATEGORY ROUTES
// ============================================================

// Get all categories
app.get("/category", async (req, res) => {
  try {
    const categories = await category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single product by product ID

app.get("/user/products/single/:id", async (req, res) =>{
  try {
    const { id } = req.params;
    const product =await product.findById(id).populate("category");
    
    if (!product) {
      return res.status(404).json({ message: "product not found"});
    }
    res.status(200).json(product)
  }catch (error) {
    console .error(error);
    res.status(500).json({ message: "Server "})
  }
}) 

// Create a new category
app.post("/category", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!title || !imagePath) {
      return res.status(400).json({ message: "Title & image are required" });
    }

    // Convert to full URL
    const imageUrl = `${req.protocol}://${req.get("host")}/${imagePath.replace(/\\/g, "/")}`;

    const newCategory = await category.create({
      title,
      image: imageUrl,  // store full URL
    });

    res.status(201).json({ product: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category by ID (✅ fixed route — matches frontend)
app.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      product: deletedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find all products that belong to this category
    const product_list = await product.find({ category: id }).populate("category");

    if (product_list.length === 0) {
      return res.status(404).json({ message: "No products found for this category" });
    }

    res.json(product_list);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// ============================================================
// 🟨 START SERVER
// ============================================================
app.listen(PORT, () =>
  console.log(`🚀 Server running at: http://localhost:${PORT}/`)
);
