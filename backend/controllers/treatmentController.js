const Treatment = require('../models/Treatment');
const Appointment = require('../models/TreatmentAppointment');
const mongoose = require('mongoose');


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


exports.bookTreatmentSession = async (req, res) => {
  const { treatmentId, startTime, endTime } = req.body;
  try {
    const conflictingAppointment = await Appointment.findOne({
      treatment: treatmentId,
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
      ]
    });
    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Treatment session time conflict' });
    }

    const treatment = await Treatment.findById(treatmentId);
    const totalPrice = treatment.price;

    const appointment = new Appointment({
      treatment: treatmentId,
      user: req.user._id,
      startTime,
      endTime,
      totalPrice
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment' });
  }
};


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