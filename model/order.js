import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: String,
  customer: String,
  date: Date,
  status: String,
  total: Number,
  shippingadress: String ,
  product : String,
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
    }
  ]
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
