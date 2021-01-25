const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
/* 
  Client can change the product price thats why we can't trust on price coming
  from the client side, so i'm only accessing the product ID and Quantity from the client
  and then finding the product with that ID.
*/
exports.getStripeSession = catchAsync(async (req, res, next) => {
  // 1) Getting ordered products IDs and Qtys
  const ids = req.body.products.map((p) => p.id);

  // 2) Getting products by ID's
  let products = await Product.find({
    _id: { $in: ids }
  }).select('title imagePath price');

  // 3) Adding qty to product objects
  products = products.map((p) => {
    // Cloning product object
    const obj = {
      id: p._id.toString(),
      title: p.title,
      imagePath: p.imagePath,
      price: p.price
    };

    // adding qty prop
    for (let productObj of req.body.products) {
      if (productObj.id === obj.id) {
        obj.qty = productObj.qty;
      }
    }
    return obj;
  });

  // 4) Creating Checkout object for Stripe
  const checkoutObj = {
    payment_method_types: ['card'],
    line_items: [],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get(
    //   'host'
    // )}/checkout-success?products=${encodeURIComponent(
    //   `${JSON.stringify(products)}`
    // )}&user=${encodeURIComponent(req.currentUser._id)}`,
    success_url: `${req.protocol}://${req.get('host')}/checkout-success`,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    customer_email: req.currentUser.email,
    client_reference_id: req.currentUser._id.toString()
  };

  for (let product of products) {
    const obj = {
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.title,
          images: [`${req.protocol}://${req.get('host')}${product.imagePath}`]
        },
        unit_amount: product.price * 100
      },
      quantity: product.qty
    };

    checkoutObj.line_items.push(obj);
  }

  // 5) Getting checkout session and sending it to the client
  const session = await stripe.checkout.sessions.create(checkoutObj);

  res.status(200).json({
    status: 'success',
    session
  });
});

// ============ Creating New Order Doc After Payment Success DEVELOPMENT ==========
// exports.createOrderCheckout = catchAsync(async (req, res, next) => {
//   const products = req.query.products;
//   const user = req.query.user;

//   if (!products || !user) return next();

//   const order = await Order.create({
//     products: JSON.parse(products),
//     user
//   });

//   req.orderId = order._id;
//   res.redirect(`${req.originalUrl.split('?')[0]}?orderId=${order._id}`);
// });

// ============ Creating New Order Doc After Payment Success PRODUCTION ==========
const createOrderCheckout = async (session) => {
  try {
    // retrieving data about line_items
    session = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    });

    const products = [];
    for (let item of session.line_items.data) {
      products.push({
        title: item.description,
        qty: item.quantity,
        price: item.price.unit_amount / 100
      });
    }

    await Order.create({
      products,
      user: session.client_reference_id,
      totalAmount: session.amount_total / 100
    });
  } catch (err) {
    console.log('Error: 💥💥💥💥💥💥💥💥💥💥💥', err.message);
  }
};

// ============ Route Called By Stripe On Checkout Success ==========
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createOrderCheckout(event.data.object);
    res.status(200).json({ received: true });
  }
};

// =============== GET All My Orders ======================
exports.getAllMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.currentUser._id }).sort(
    '-createdAt'
  );
  res.status(200).json({
    status: 'success',
    results: orders.length,
    orders
  });
});

// =============== DELETE My Order ======================
exports.deleteMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOneAndDelete({
    _id: req.params.id,
    user: req.currentUser._id
  });

  if (!order)
    return next(new AppError('No order found with the given ID', 404));

  res.status(204).json({
    status: 'success'
  });
});
