const Lab = require('../models/Lab');
const Appointment = require('../models/LabAppointment');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createLabSession = async (req, res) => {
  const { name, category, description, price, services, availability } = req.body;
  try {
    const lab = new Lab({
      name,
      category,
      description,
      price,
      services,
      availability,
      createdBy: req.user._id
    });
    await lab.save();
    res.status(201).json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lab session' });
  }
};

exports.getAvailableLabSessions = async (req, res) => {
  try {
    const labs = await Lab.find({});
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching labs' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('lab', 'name category')
      .sort({ startTime: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.manageBookings = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name')
      .populate('lab', 'name category');
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.bookLabSessionWithPayment = async (req, res) => {
  const { labId, startTime, endTime, price, paymentMethodId } = req.body;

  try {
    const conflictingAppointment = await Appointment.findOne({
      lab: labId,
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Lab session time conflict' });
    }

    const lab = await Lab.findById(labId);
    const totalPrice = lab.price * 100; // Stripe accepts payments in cents

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice, // in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    // After successful payment, save the appointment
    const appointment = new Appointment({
      lab: labId,
      user: req.user._id,
      startTime,
      endTime,
      totalPrice: lab.price
    });
    await appointment.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error booking appointment or processing payment:', error);
    
    if (error.raw && error.raw.message) {
      return res.status(500).json({ message: error.raw.message });
    }

    res.status(500).json({ message: 'Payment or booking failed', error: error.message });
  }
};