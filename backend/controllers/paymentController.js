const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processPayment = async (req, res) => {
  const { paymentMethodId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.json({ message: 'Payment successful!', paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

module.exports = { processPayment };
