const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    products: [{}],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is not defined!']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is not defined!']
    },
    paid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
