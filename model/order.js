import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
       customer:{type :String, required : true },
      orderId: { type: Number, required: true },
      date: { type: Date, required: true },
     status: { type:String, required: true },
      total: { type: Number, required: true },
      

      items : [
        {
        product :{type : mongoose.Schema.Types.ObjectId, ref: "product" },
        name: String,
        qty: Number,
      price: Number,
    },
      ]
    });
  
const Order = mongoose.model("Order", orderSchema);

export default Order;



// ==========================

