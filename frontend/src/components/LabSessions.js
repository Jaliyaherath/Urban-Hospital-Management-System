// frontend/src/components/LabSessions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LabSessions = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add state to track if the user is an admin

  // Form states for creating a lab session
  const [labName, setLabName] = useState('');
  const [labCategory, setLabCategory] = useState('');
  const [labPrice, setLabPrice] = useState('');
  const [labDescription, setLabDescription] = useState('');
  
  // Fetch available lab sessions
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/labs/available', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLabs(response.data);
      } catch (error) {
        console.error('Error fetching lab sessions:', error);
      }
    };
    fetchLabs();
  }, []);

  // Fetch user’s lab appointments
  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/labs/my-appointments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUserAppointments(response.data);
      } catch (error) {
        console.error('Error fetching user appointments:', error);
      }
    };
    fetchUserAppointments();
  }, []);

  // Fetch user role (to determine if user is admin or staff)
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsAdmin(response.data.role === 'admin' || response.data.role === 'staff');
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    checkUserRole();
  }, []);

  // Book a lab appointment
  const bookAppointment = async (labId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/labs/book', 
        { labId, startTime, endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment booked successfully');
      setLoading(false);
      setSelectedLab(null); // Reset selected lab
    } catch (error) {
      console.error('Error booking appointment:', error.response.data.message);
      setLoading(false);
    }
  };

  // Create a lab session (Admin and Staff only)
  const createLabSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/labs/create', 
        { name: labName, category: labCategory, price: labPrice, description: labDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Lab session created successfully');
      setLoading(false);
      // Clear the form
      setLabName('');
      setLabCategory('');
      setLabPrice('');
      setLabDescription('');
    } catch (error) {
      console.error('Error creating lab session:', error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Available Lab Sessions</h2>
      <ul>
        {labs.map((lab) => (
          <li key={lab._id}>
            {lab.name} - {lab.category} - ${lab.price}
            <button onClick={() => setSelectedLab(lab)}>Book</button>
          </li>
        ))}
      </ul>

      {selectedLab && (
        <div>
          <h3>Book Lab: {selectedLab.name}</h3>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label>End Time:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <button onClick={() => bookAppointment(selectedLab._id)} disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
          <button onClick={() => setSelectedLab(null)}>Cancel</button>
        </div>
      )}

      <h2>Your Lab Appointments</h2>
      <ul>
        {userAppointments.map((appointment) => (
          <li key={appointment._id}>
            {appointment.lab.name} - ${appointment.totalPrice} - {new Date(appointment.startTime).toLocaleString()} - {appointment.status}
          </li>
        ))}
      </ul>

      {/* Show lab session creation form only for admins and staff */}
      {isAdmin && (
        <div>
          <h2>Create New Lab Session</h2>
          <label>Lab Name:</label>
          <input
            type="text"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
          />
          <label>Category:</label>
          <input
            type="text"
            value={labCategory}
            onChange={(e) => setLabCategory(e.target.value)}
          />
          <label>Price:</label>
          <input
            type="number"
            value={labPrice}
            onChange={(e) => setLabPrice(e.target.value)}
          />
          <label>Description:</label>
          <input
            type="text"
            value={labDescription}
            onChange={(e) => setLabDescription(e.target.value)}
          />
          <button onClick={createLabSession} disabled={loading}>
            {loading ? 'Creating...' : 'Create Lab Session'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LabSessions;
