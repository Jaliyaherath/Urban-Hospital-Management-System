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
    <div>
      <h2>Manage Treatment Appointments</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            {appointment.treatment.name} - {appointment.user.name} - ${appointment.totalPrice}
            <button onClick={() => deleteAppointment(appointment._id)} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={() => updateStatus(appointment._id, 'completed')}>
              Mark as Completed
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTreatmentAppointments;