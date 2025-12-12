// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import productModel from "./model/product.js";
import categoryModel from "./model/category.js";
import userModel from "./model/user.js";
import orderModel from "./model/order.js"; // ✅ import Order model
import { upload } from "./multer.js";
import jwt from "jsonwebtoken";
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = 8080;

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ==========================
// DATABASE CONNECTION
// ==========================
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
    const products = await productModel.find().populate("category");
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by ID
app.get("/user/products/single/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await productModel.findById(id).populate("category");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a new product
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, description } = req.body;
    const image = req.file ? req.file.path : null;

    const newProduct = await productModel.create({ title, price, category, description, image });
    res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (err) {
    console.error(err);
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
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category
app.get("/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel.find({ category: categoryId }).populate("category");

    if (!products.length) return res.status(404).json({ message: "No products found for this category" });

    res.json(products);
  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete category by ID
app.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);

    if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully", category: deletedCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================
// ORDER ROUTES
// ==========================

// Create order
app.post("/order", async (req, res) => {
  try {
    const {orderId, customer ,  date ,status, total, shippingadress, product } = req.body
  itemsnewOrder = new orderModel(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
     const newProduct = await productModel.create({orderId, customer,date,status,total,shippingadress,product});
     }
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single order by ID
app.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await orderModel.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: err.message });
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
  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route example
app.get("/cartpage", authMiddleware, (req, res) => {
  res.json({ message: "Cart page details", user: req.user });
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/`));