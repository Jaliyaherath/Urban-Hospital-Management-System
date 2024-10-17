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
    <div>
      <h2>Available Treatment Sessions</h2>
      <ul>
        {treatments.map((treatment) => (
          <li key={treatment._id}>
            {treatment.name} - {treatment.category} - ${treatment.price}
            <button onClick={() => setSelectedTreatment(treatment)}>Book</button>
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

      <h2>Your Treatment Appointments</h2>
      <ul>
        {userAppointments.map((appointment) => (
          <li key={appointment._id}>
            {appointment.treatment.name} - ${appointment.totalPrice} - {new Date(appointment.startTime).toLocaleString()} - {appointment.status}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div>
          <h2>Create New Treatment Session</h2>
          <label>Treatment Name:</label>
          <input
            type="text"
            value={treatmentName}
            onChange={(e) => setTreatmentName(e.target.value)}
          />
          <label>Category:</label>
          <input
            type="text"
            value={treatmentCategory}
            onChange={(e) => setTreatmentCategory(e.target.value)}
          />
          <label>Price:</label>
          <input
            type="number"
            value={treatmentPrice}
            onChange={(e) => setTreatmentPrice(e.target.value)}
          />
          <label>Description:</label>
          <input
            type="text"
            value={treatmentDescription}
            onChange={(e) => setTreatmentDescription(e.target.value)}
          />
          <label>Availability:</label>
          <input
            type="datetime-local"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
          <button onClick={createTreatmentSession} disabled={loading}>
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
    <div>
      <h3>Book Treatment: {selectedTreatment.name}</h3>
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

      <CardElement />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={() => bookAppointment(selectedTreatment._id, selectedTreatment.price)}
        disabled={loading || !stripe}
      >
        {loading ? 'Booking...' : 'Confirm Booking & Pay'}
      </button>

      <button onClick={() => setSelectedTreatment(null)}>Cancel</button>
    </div>
  );
};

export default TreatmentSessions;