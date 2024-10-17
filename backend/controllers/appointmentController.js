const Appointment = require('../models/Appointment');
require("dotenv").config();
const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Function to upload a file to S3
const uploadImageToS3 = async (buffer, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Replace with your bucket name
    Key: `images/${Date.now()}_${fileName}`, // Unique file name
    Body: buffer,
    ACL: "public-read", // File will be publicly accessible
    ContentType: "image/png", // Assuming CVs are PDFs
  };

  return s3.upload(params).promise();
};

exports.createAppointment = async (req, res) => {
  try {
    const { hospital, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Upload image to S3
    const uploadResult = await uploadImageToS3(
      req.file.buffer,
      req.file.originalname
    );

    const appointment = await Appointment.create({
      patient: req.user._id,
      hospital,
      date,
      picture: uploadResult.Location, // Store the image URL
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppointmentsForPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppointmentsForHospitalStaff = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
