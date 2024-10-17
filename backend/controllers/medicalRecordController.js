const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");
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
const uploadPDFToS3 = async (buffer, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Replace with your bucket name
    Key: `record/${Date.now()}_${fileName}`, // Unique file name
    Body: buffer,
    ACL: "public-read", // File will be publicly accessible
    ContentType: "application/pdf",
  };

  return s3.upload(params).promise();
};

// Add Medical Record (Staff/Admin)
exports.addMedicalRecord = async (req, res) => {
  try {
    const { record } = req.body;
    const userId = req.user._id; // Use userId from the protect middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Upload file to S3
    const uploadResult = await uploadPDFToS3(
      req.file.buffer,
      req.file.originalname
    );

    // Create a new medical record
    const newRecord = await MedicalRecord.create({
      patient: user._id,
      record,
      pdfUrl: uploadResult.Location,
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMedicalRecordsForPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const { recordId, newRecord } = req.body;

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      recordId,
      { record: newRecord },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.body;

    const deletedRecord = await MedicalRecord.findByIdAndDelete(recordId);
    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
