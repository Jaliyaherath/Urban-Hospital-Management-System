import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');
  const [picture, setPicture] = useState(null);
  const [role, setRole] = useState('');

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

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available, please log in.');
      }

      // Create FormData to handle file upload
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
      fetchAppointments(); // Refresh appointments list
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  const handleUpdate = async (id, newDate) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}`,
        { date: newDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {role === 'staff' || role === 'admin' ? 'Manage Appointments' : 'Book Appointment'}
      </h2>

      {role === 'user' && (
        <form onSubmit={handleBooking} className="mb-8">
          <div className="mb-4">
            <label className="block text-gray-700">Hospital</label>
            <input
              type="text"
              placeholder="Enter Hospital Name"
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
              name="picture"
              id="picture"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Book Appointment
          </button>
        </form>
      )}

      <h3 className="text-xl font-medium mb-4">Your Appointments</h3>
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
                  onClick={() => handleUpdate(appt._id, prompt('Enter new date'))}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Edit
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(appt._id)}
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
    </div>
  );
};

export default Appointments;
