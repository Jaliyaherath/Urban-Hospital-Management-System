import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTreatmentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/treatments/manage-appointments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  // Handle appointment deletion
  const deleteAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/treatments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(appointments.filter(appointment => appointment._id !== appointmentId));
      alert('Appointment deleted successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setLoading(false);
    }
  };

  // Update appointment status
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/treatments/${appointmentId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedAppointments = appointments.map(appointment => {
        if (appointment._id === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      });
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4">Manage Treatment Appointments</h2>
      <ul className="space-y-4">
        {appointments.map((appointment) => (
          <li key={appointment._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div className="flex-1">
              <h3 className="text-xl font-medium">{appointment.treatment.name}</h3>
              <p className="text-gray-600">
                User: {appointment.user.name} - Price: ${appointment.totalPrice} - Status: {appointment.status}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => deleteAppointment(appointment._id)}
                disabled={loading}
                className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => updateStatus(appointment._id, 'completed')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Mark as Completed
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTreatmentAppointments;
