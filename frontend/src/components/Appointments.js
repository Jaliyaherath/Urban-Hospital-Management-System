import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');
  const [picture, setPicture] = useState(null);
  const [role, setRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for edit modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // State for booking modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [appointmentToDelete, setAppointmentToDelete] = useState(null); // Store appointment for deletion
  const [editingAppointment, setEditingAppointment] = useState(null); // Store appointment being edited

  // Fetch user role and appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available, please log in.');
      }

      // Get role
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole(userResponse.data.role);

      // Get appointments based on role
      const response =
        role === 'staff' || role === 'admin'
          ? await axios.get('http://localhost:5000/api/appointments/staff', {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await axios.get('http://localhost:5000/api/appointments/patient', {
              headers: { Authorization: `Bearer ${token}` },
            });

      setAppointments(response.data);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [role]);

  // Open modal for editing appointment
  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setHospital(appointment.hospital);
    setDate(new Date(appointment.date).toISOString().substr(0, 10));
    setPicture(null); // Optional: You can display the existing image
    setIsModalOpen(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available, please log in.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('hospital', hospital);
      formData.append('date', date);
      if (picture) {
        formData.append('picture', picture);
      }

      await axios.post(
        'http://localhost:5000/api/appointments/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setIsBookingModalOpen(false); // Close booking modal
      fetchAppointments(); // Refresh appointments list
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('hospital', hospital);
      formData.append('date', date);
      if (picture) {
        formData.append('picture', picture);
      }

      await axios.put(
        `http://localhost:5000/api/appointments/${editingAppointment._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false); // Close modal after update
      fetchAppointments();
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteModalOpen(false); // Close delete modal
      fetchAppointments();
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {role === 'staff' || role === 'admin' ? 'Manage Appointments' : 'Your Appointments'}
      </h2>

      {/* Button to open booking modal */}
      {role === 'user' && (
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="mb-8 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Book Appointment
        </button>
      )}

      <h3 className="text-xl font-medium mb-4">Appointments List</h3>
      <ul className="space-y-4">
        {appointments.map((appt) => (
          <li
            key={appt._id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-medium text-gray-800">{appt.hospital}</p>
              <p className="text-gray-600">{new Date(appt.date).toLocaleDateString()}</p>
              {appt.picture && (
                <img
                  src={appt.picture}
                  alt="Appointment"
                  className="mt-2 w-20 h-20 object-cover rounded-lg"
                />
              )}
            </div>

            {role === 'staff' || role === 'admin' ? (
              <div className="space-x-2">
                <button
                  onClick={() => openEditModal(appt)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Edit
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => openDeleteModal(appt)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-gray-700">Hospital</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Upload Picture</label>
                <input
                  type="file"
                  onChange={(e) => setPicture(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Edit Appointment</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700">Hospital</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Upload Picture</label>
                <input
                  type="file"
                  onChange={(e) => setPicture(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this appointment?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
