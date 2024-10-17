import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY); // Load the publishable key

const LabSessions = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const [isAdminOrStaff, setIsAdminOrStaff] = useState(false); // Role checking for admin/staff
  const [newLab, setNewLab] = useState({ name: '', category: '', price: 0, description: '' });

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
    checkUserRole();
    fetchUserAppointments(); // Fetch user appointments on component mount
  }, []);

  // Check if the user is an admin or hospital staff
  const checkUserRole = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const role = response.data.role;
      if (role === 'Admin' || role === 'hospitalStaff') {
        setIsAdminOrStaff(true);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  // Fetch user appointments
  const fetchUserAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/labs/my-appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserAppointments(response.data);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
    }
  };

  // Handle lab session creation
  const createLabSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/labs',
        { ...newLab },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Lab session created successfully');
      setLabs([...labs, response.data]); // Add the new lab to the labs list
      setNewLab({ name: '', category: '', price: 0, description: '' });
    } catch (error) {
      console.error('Error creating lab session:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4">Available Lab Sessions</h2>
      <ul className="space-y-4">
        {labs.map((lab) => (
          <li key={lab._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div>
              <h3 className="text-xl font-medium">{lab.name}</h3>
              <p>{lab.category} - ${lab.price}</p>
            </div>
            <button
              onClick={() => setSelectedLab(lab)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Book
            </button>
          </li>
        ))}
      </ul>

      {selectedLab && (
        <Elements stripe={stripePromise}>
          <LabBookingForm
            selectedLab={selectedLab}
            setSelectedLab={setSelectedLab}
            fetchUserAppointments={fetchUserAppointments} // Pass fetchUserAppointments to update appointments after booking
          />
        </Elements>
      )}

      <h2 className="text-3xl font-semibold my-6">Your Lab Appointments</h2>
      <ul className="space-y-4">
        {userAppointments.map((appointment) => (
          <li key={appointment._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div>
              <h3 className="text-xl font-medium">{appointment.lab.name}</h3>
              <p>${appointment.totalPrice} - {new Date(appointment.startTime).toLocaleString()} - {appointment.status}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Conditionally render lab creation form if user is Admin or hospitalStaff */}
      {isAdminOrStaff && (
        <div className="mt-8 p-6 bg-white rounded shadow-md">
          <h2 className="text-3xl font-semibold mb-4">Create a New Lab Session</h2>
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            value={newLab.name}
            onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
            className="border rounded w-full p-2 mb-4"
          />
          <label className="block mb-2">Category:</label>
          <input
            type="text"
            value={newLab.category}
            onChange={(e) => setNewLab({ ...newLab, category: e.target.value })}
            className="border rounded w-full p-2 mb-4"
          />
          <label className="block mb-2">Price:</label>
          <input
            type="number"
            value={newLab.price}
            onChange={(e) => setNewLab({ ...newLab, price: parseFloat(e.target.value) })}
            className="border rounded w-full p-2 mb-4"
          />
          <label className="block mb-2">Description:</label>
          <input
            type="text"
            value={newLab.description}
            onChange={(e) => setNewLab({ ...newLab, description: e.target.value })}
            className="border rounded w-full p-2 mb-4"
          />
          <button
            onClick={createLabSession}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Create Lab Session
          </button>
        </div>
      )}
    </div>
  );
};

const LabBookingForm = ({ selectedLab, setSelectedLab, fetchUserAppointments }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const bookAppointment = async (labId) => {
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);

      if (!stripe || !cardElement) {
        setError('Stripe has not loaded');
        setLoading(false);
        return;
      }

      // Create payment method
      const paymentMethodResponse = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodResponse.error) {
        setError(paymentMethodResponse.error.message);
        setLoading(false);
        return;
      }

      // Log the paymentMethodId for debugging
      console.log('PaymentMethodId:', paymentMethodResponse.paymentMethod.id);

      // Send paymentMethodId and booking data to the server
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/labs/book-with-payment',
        {
          labId,
          startTime,
          endTime,
          paymentMethodId: paymentMethodResponse.paymentMethod.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Appointment booked and payment successful');
      setLoading(false);
      setSelectedLab(null); // Reset selected lab
      fetchUserAppointments(); // Fetch user appointments after booking
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error booking appointment or processing payment'
      );
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Book Lab: {selectedLab.name}</h3>
      <label className="block mb-2">Start Time:</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="border rounded w-full p-2 mb-4"
      />
      <label className="block mb-2">End Time:</label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="border rounded w-full p-2 mb-4"
      />

      <CardElement className="border rounded p-2 mb-4" />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => bookAppointment(selectedLab._id)} // Remove price parameter
        disabled={loading || !stripe}
        className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Booking...' : 'Confirm Booking & Pay'}
      </button>

      <button
        onClick={() => setSelectedLab(null)}
        className="w-full mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
      >
        Cancel
      </button>
    </div>
  );
};

export default LabSessions;
