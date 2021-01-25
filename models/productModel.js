const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is not defined!']
    },
    description: [String],
    price: {
      type: Number,
      required: [true, 'Price is not defined!']
    },
    imagePath: {
      type: String,
      required: [true, 'Product image is not defined!']
    },
    avgRating: {
      type: Number,
      default: 4.5
    },
    ratingsQty: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
