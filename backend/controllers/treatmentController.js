const Treatment = require('../models/Treatment');
const Appointment = require('../models/TreatmentAppointment');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createTreatmentSession = async (req, res) => {
  const { name, category, description, price, services, availability } = req.body;
  
  
  console.log('Request Body:', req.body);
  
 
  console.log('User ID:', req.user._id);
  
  try {
    const treatment = new Treatment({
      name,
      category,
      description,
      price,
      services,
      availability,
      createdBy: req.user._id
    });
    await treatment.save();
    res.status(201).json(treatment);
  } catch (error) {
    console.error('Error creating treatment session:', error); // Log the error
    res.status(500).json({ message: 'Error creating treatment session' });
  }
};


exports.getAvailableTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find({});
    res.status(200).json(treatments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching treatments' });
  }
};


// exports.bookTreatmentSession = async (req, res) => {
//   const { treatmentId, startTime, endTime } = req.body;
//   try {
//     const conflictingAppointment = await Appointment.findOne({
//       treatment: treatmentId,
//       $or: [
//         { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
//         { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
//       ]
//     });
//     if (conflictingAppointment) {
//       return res.status(400).json({ message: 'Treatment session time conflict' });
//     }

//     const treatment = await Treatment.findById(treatmentId);
//     const totalPrice = treatment.price;

//     const appointment = new Appointment({
//       treatment: treatmentId,
//       user: req.user._id,
//       startTime,
//       endTime,
//       totalPrice
//     });
//     await appointment.save();
//     res.status(201).json(appointment);
//   } catch (error) {
//     res.status(500).json({ message: 'Error booking appointment' });
//   }
// };


exports.getUserBookings = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('treatment', 'name category')
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
      .populate('treatment', 'name category');
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.bookTreatmentSessionWithPayment = async (req, res) => {
  const { treatmentId, startTime, endTime, price, paymentMethodId } = req.body;

  try {
    console.log('Received booking request:', req.body);

    const conflictingAppointment = await Appointment.findOne({
      treatment: treatmentId,
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
      ]
    });

    if (conflictingAppointment) {
      console.log('Conflict found:', conflictingAppointment);
      return res.status(400).json({ message: 'Treatment session time conflict' });
    }

    const treatment = await Treatment.findById(treatmentId);
    if (!treatment) {
      console.log('Treatment not found:', treatmentId);
      return res.status(404).json({ message: 'Treatment not found' });
    }

    const totalPrice = price * 100; // Stripe accepts payments in cents
    console.log('Total price in cents:', totalPrice);

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

    console.log('Payment intent created:', paymentIntent);

    // After successful payment, save the appointment
    const appointment = new Appointment({
      treatment: treatmentId,
      user: req.user._id,
      startTime,
      endTime,
      totalPrice: price
    });
    await appointment.save();

    console.log('Appointment saved:', appointment);

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error booking appointment or processing payment:', error);

    if (error.raw && error.raw.message) {
      return res.status(500).json({ message: error.raw.message });
    }

    res.status(500).json({ message: 'Payment or booking failed', error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    await Appointment.findByIdAndDelete(appointmentId);
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status' });
  }
}