const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const generateReport = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalMedicalRecords = await MedicalRecord.countDocuments();

    const appointmentsByHospital = await Appointment.aggregate([
      { $group: { _id: '$hospital', count: { $sum: 1 } } },
    ]);

    res.json({
      totalAppointments,
      totalMedicalRecords,
      appointmentsByHospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = { generateReport };
