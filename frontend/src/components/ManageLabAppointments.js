import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageLabAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/labs/manage-appointments', {
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
      await axios.delete(`http://localhost:5000/api/labs/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(appointments.filter(appointment => appointment._id !== appointmentId));
      toast.success('Lab Appointment deleted successfully', { autoClose: 1200 });
      setLoading(false);
    } catch (error) {
      console.error('Error deleting lab appointment:', error);
      toast.error('Failed to delete lab appointment', { autoClose: 1200 }); // Add error toast
      setLoading(false);
    }
  };

  // Update appointment status
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/labs/${appointmentId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedAppointments = appointments.map(appointment => {
        if (appointment._id === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      });
      toast.success('Lab Appointment updated successfully', { autoClose: 1200 }); // Replace alert with toast
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update lab appointment status', { autoClose: 1200 }); // Add error toast
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4">Manage Lab Appointments</h2>
      <ul className="space-y-4">
        {appointments.map((appointment) => (
          <li key={appointment._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div className="flex-1">
              <h3 className="text-xl font-medium">{appointment.lab.name}</h3>
              <p className="text-gray-600">
                User: {appointment.user.name} - Price: ${appointment.totalPrice} - Status: {appointment.status}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => deleteAppointment(appointment._id)}
                className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition`}
              >
                Delete
              </button>
              {appointment.status !== "completed" ? (
                <button
                  onClick={() => updateStatus(appointment._id, 'completed')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Mark as Completed
                </button>
              ) : (
                <button
                  disabled
                  className="bg-green-500 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
                >
                  Already Completed
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
};

export default ManageLabAppointments;