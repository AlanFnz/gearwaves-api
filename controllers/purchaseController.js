const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently buyed product
  const product = await Product.findById(req.params.productId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // Old workaround for development
    // success_url: `${req.protocol}://${req.get('host')}/?product=${
    //   req.params.productId
    // }&user=${req.user.id}&price=${product.price}`,
    // Final method
    success_url: `${req.protocol}://gearwaves-cli.herokuapp.com/success`,
    cancel_url: `${req.protocol}://gearwaves-cli.herokuapp.com/products/${product.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: [
      {
        name: `${product.name} product`,
        description: product.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/products/${
            product.imageCover
          }`,
        ],
        amount: product.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createPurchaseCheckout = catchAsync(async (req, res, next) => {
//   // Temporary workaround (unsafe)
//   const { product, user, price } = req.query;
//   if (!product && !user && !price) return next();
//   await Purchase.create({ product, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createPurchaseCheckout = async session => {
  const product = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Purchase.create({ product, user, price });
};

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
  if (event.type === 'checkout.session.completed')
    createPurchaseCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.getAllPurchases = factory.getAll(Purchase);
exports.getPurchase = factory.getOne(Purchase);
exports.createPurchase = factory.createOne(Purchase);
exports.updatePurchase = factory.updateOne(Purchase);
exports.deletePurchase = factory.deleteOne(Purchase);
