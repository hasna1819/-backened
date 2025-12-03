import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import productModel from "./model/product.js";
import categoryModel from "./model/category.js";
import userModel from "./model/user.js";
import { upload } from "./multer.js";
import jwt from "jsonwebtoken";
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ==========================
// PRODUCT ROUTES
// ==========================

// Get all products
app.get("/products", authMiddleware, async (req, res) => {
  try {
    const productList = await productModel.find();
    res.json(productList);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by ID
app.get("/user/products/single/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const productItem = await productModel.findById(id);
    if (!productItem) return res.status(404).json({ message: "Product not found" });

    res.json({ product: productItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new product
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, description } = req.body;
    const image = req.file ? req.file.path : null;

    const newProduct = await productModel.create({ title, price, category, description, image });
    res.status(201).json({ product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================
// CATEGORY ROUTES
// ==========================

// Get all categories
app.get("/category", async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category
app.get("/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel.find({ category: categoryId }).populate("category");

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this category" });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new category
app.post("/category", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!title || !imagePath) {
      return res.status(400).json({ message: "Title & image are required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/${imagePath.replace(/\\/g, "/")}`;

    const newCategory = await categoryModel.create({ title, image: imageUrl });
    res.status(201).json({ category: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category by ID
app.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);

    if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully", category: deletedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================
// USER ROUTES
// ==========================

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await userModel.create({ name, email, password });
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usr = await userModel.findOne({ email });

    if (!usr) return res.status(404).json({ error: "User not found" });

    if (password === usr.password) {
      const token = jwt.sign({ name: usr.name, email: usr.email }, "scam-alert");
      return res.json({ user: usr, token, message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route example
app.get("/cartpage", authMiddleware, (req, res) => {
  res.json({ message: "Cart page details", user: req.user });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/`));
