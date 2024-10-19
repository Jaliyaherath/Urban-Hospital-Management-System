const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const LabRecord = require('../models/LabAppointment');
const TreatemtRecord = require('../models/TreatmentAppointment');

const generateReport = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalMedicalRecords = await MedicalRecord.countDocuments();
    const totalLabRecords = await LabRecord.countDocuments();
    const totalTreatmentRecords = await TreatemtRecord.countDocuments();

    const appointmentsByHospital = await Appointment.aggregate([
      { $group: { _id: '$hospital', count: { $sum: 1 } } },
    ]);

    res.json({
      totalAppointments,
      totalMedicalRecords,
      appointmentsByHospital,
      totalLabRecords,
      totalTreatmentRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = { generateReport };
