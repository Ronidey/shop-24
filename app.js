const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const globalErrorHandler = require('./controllers/errorController');
const orderCtrl = require('./controllers/orderController');
const AppError = require('./utils/appError');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ========= Global Middlewares ===========

// ----- Setting security headers -------
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'js.stripe.com', "'unsafe-inline'"],
      'frame-src': ['js.stripe.com'],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"]
    }
  })
);

// ----- Rate Limiting --------
const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 15,
  message: 'Too many requests from this IP, please try again in an hour!!'
});
app.use('/api', limiter);

// ============== Stripe Checkout ===============
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderCtrl.webhookCheckout
);

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ----- Data Sanitization against NoSQL injection query --------
app.use(mongoSanitize());

// -------- Data Sanitization against XSS ---------
app.use(xss());

// --------- Preventing parameter pollution ----------
app.use(hpp());

// ----- Parsing cookies ---------
app.use(cookieParser());

// ---------- Compressing response bodies --------
app.use(compression());

app.use((req, res, next) => {
  res.locals.hasAccount = Boolean(req.cookies.hasAccount);
  next();
});

// ------- Heroku (forcing http to https) ------------
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`);
    else next();
  });
}

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/', viewRouter);

app.get('*', (req, res, next) => {
  next(new AppError('Page Not Found!', 404));
});

app.use(globalErrorHandler);
module.exports = app;
