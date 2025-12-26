import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import productModel from "./model/product.js";
import categoryModel from "./model/category.js";
import userModel from "./model/user.js";
import orderModel from "./model/order.js";

import { upload } from "./multer.js";
import authMiddleware from "./middleware/auth.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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
  .catch((err) => {
    console.error("❌ DB CONNECTION FAILED:", err);
    process.exit(1);
  });

// ==========================
// PRODUCT ROUTES
// ==========================

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await productModel.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get single Product by Id

// Get single product by ID
app.get("/user/products/single/:id", async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productModel.findById(id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, description } = req.body;
    const image = req.file ? req.file.path : null;

    const newProduct = await productModel.create({
      title,
      price,
      category,
      description,
      image,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted", product: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// CATEGORY ROUTES
// ==========================

// Get all categories
app.get("/category", async (req, res) => {
  try {
    const category = await categoryModel.find();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category
app.post("/category", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: "Title and image required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(
      /\\/g,
      "/"
    )}`;

    const category = await categoryModel.create({ title, image: imageUrl });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete category
app.delete("/category/:id", async (req, res) => {
  try {
    const deleted = await categoryModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted", category: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await userModel.create({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email)
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "scam-alert", {
      expiresIn: "1d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// ORDER ROUTES
// ==========================
  app.post("/Orderdetails", async (req, res) => {
  try {
    const { customer, status, items } = req.body;

    if (!customer || !status || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "All fields required" });
    }

    const formattedItems = items.map((item) => ({
      product: item.productId,
      name: item.name || "",
      qty: Number(item.qty) || 1,
      price: Number(item.price) || 0,
    }));

    const total = formattedItems.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    const newOrder = await orderModel.create({
      customer,
      status,
      total,
      items: formattedItems,
      date: new Date(),
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GEt all order
app.get("/Orderdetails", authMiddleware, async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
