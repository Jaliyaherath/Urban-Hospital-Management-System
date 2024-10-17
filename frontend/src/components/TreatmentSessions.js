import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const TreatmentSessions = () => {
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states for creating a treatment session
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentCategory, setTreatmentCategory] = useState('');
  const [treatmentPrice, setTreatmentPrice] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [availability, setAvailability] = useState('');

  // Fetch available treatment sessions
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/treatments/available', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTreatments(response.data);
      } catch (error) {
        console.error('Error fetching treatment sessions:', error);
      }
    };
    fetchTreatments();
  }, []);

  // Fetch user’s treatment appointments
  const fetchUserAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/treatments/my-appointments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserAppointments(response.data);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
    }
  };

  useEffect(() => {
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

  // Create a treatment session (Admin and Staff only)
  const createTreatmentSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/treatments/create', 
        { 
          name: treatmentName, 
          category: treatmentCategory, 
          price: treatmentPrice, 
          description: treatmentDescription, 
          services: [], 
          availability: new Date(availability) // Ensure availability is included
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Treatment session created successfully');
      setLoading(false);
      // Clear the form
      setTreatmentName('');
      setTreatmentCategory('');
      setTreatmentPrice('');
      setTreatmentDescription('');
      setAvailability(''); // Clear availability
    } catch (error) {
      console.error('Error creating treatment session:', error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4">Available Treatment Sessions</h2>
      <ul className="space-y-4">
        {treatments.map((treatment) => (
          <li key={treatment._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div>
              <h3 className="text-xl font-medium">{treatment.name}</h3>
              <p className="text-gray-600">
                {treatment.category} - ${treatment.price}
              </p>
            </div>
            <button 
              onClick={() => setSelectedTreatment(treatment)} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Book
            </button>
          </li>
        ))}
      </ul>

      {selectedTreatment && (
        <Elements stripe={stripePromise}>
          <TreatmentBookingForm
            selectedTreatment={selectedTreatment}
            setSelectedTreatment={setSelectedTreatment}
            fetchUserAppointments={fetchUserAppointments}
          />
        </Elements>
      )}

      <h2 className="text-3xl font-semibold mb-4 mt-8">Your Treatment Appointments</h2>
      <ul className="space-y-4">
        {userAppointments.map((appointment) => (
          <li key={appointment._id} className="flex justify-between items-center p-4 bg-white rounded shadow-md">
            <div>
              <h3 className="text-xl font-medium">{appointment.treatment.name}</h3>
              <p className="text-gray-600">
                ${appointment.totalPrice} - {new Date(appointment.startTime).toLocaleString()} - {appointment.status}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="mt-8 p-4 bg-white rounded shadow-md">
          <h2 className="text-3xl font-semibold mb-4">Create New Treatment Session</h2>
          <label className="block mb-2">Treatment Name:</label>
          <input
            type="text"
            value={treatmentName}
            onChange={(e) => setTreatmentName(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <label className="block mb-2">Category:</label>
          <input
            type="text"
            value={treatmentCategory}
            onChange={(e) => setTreatmentCategory(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <label className="block mb-2">Price:</label>
          <input
            type="number"
            value={treatmentPrice}
            onChange={(e) => setTreatmentPrice(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <label className="block mb-2">Description:</label>
          <input
            type="text"
            value={treatmentDescription}
            onChange={(e) => setTreatmentDescription(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <label className="block mb-2">Availability:</label>
          <input
            type="datetime-local"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <button 
            onClick={createTreatmentSession} 
            disabled={loading}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Treatment Session'}
          </button>
        </div>
      )}
    </div>
  );
};

const TreatmentBookingForm = ({ selectedTreatment, setSelectedTreatment, fetchUserAppointments }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const bookAppointment = async (treatmentId, price) => {
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
        'http://localhost:5000/api/treatments/book-with-payment',
        {
          treatmentId,
          startTime,
          endTime,
          price,
          paymentMethodId: paymentMethodResponse.paymentMethod.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Appointment booked and payment successful');
      setLoading(false);
      setSelectedTreatment(null); // Reset selected treatment
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
    <div className="mt-8 p-4 bg-white rounded shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Book Treatment: {selectedTreatment.name}</h3>
      <label className="block mb-2">Start Time:</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />
      <label className="block mb-2">End Time:</label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />

      <CardElement className="mb-4" />
      {error && <p className="text-red-600">{error}</p>}
      <button
        onClick={() => bookAppointment(selectedTreatment._id, selectedTreatment.price)}
        disabled={loading || !stripe}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Booking...' : 'Confirm Booking & Pay'}
      </button>

      <button 
        onClick={() => setSelectedTreatment(null)} 
        className="ml-4 text-gray-600 underline"
      >
        Cancel
      </button>
    </div>
  );
};

export default TreatmentSessions;
