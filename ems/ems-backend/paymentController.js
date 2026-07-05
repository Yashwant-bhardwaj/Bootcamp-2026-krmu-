const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// POST /api/payments/create-checkout
exports.createCheckout = async (req, res) => {
  const { plan } = req.body; // 'pro'
  const prices = { pro: 999 }; // $9.99 in cents

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    line_items: [{ price_data: { currency: 'usd', product_data: { name: `${plan} Plan` }, unit_amount: prices[plan] }, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    metadata: { userId: req.user._id.toString(), plan },
  });

  await Transaction.create({ user: req.user._id, stripeSessionId: session.id, amount: prices[plan], plan });
  res.json({ success: true, url: session.url });
};

// POST /api/payments/webhook  (raw body — configured in server.js)
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature invalid');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, plan } = session.metadata;
    await Transaction.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'paid' });
    await User.findByIdAndUpdate(userId, { subscription: plan });
  }

  res.json({ received: true });
};

// GET /api/payments/history
exports.paymentHistory = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, transactions });
};

// POST /api/payments/refund
exports.refund = async (req, res) => {
  const { sessionId } = req.body;
  const txn = await Transaction.findOne({ stripeSessionId: sessionId, user: req.user._id });
  if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await stripe.refunds.create({ payment_intent: session.payment_intent });
  txn.status = 'refunded';
  await txn.save();
  res.json({ success: true, message: 'Refund processed' });
};
