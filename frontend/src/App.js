// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Payment from './components/Payment';
import Report from './components/Report';
import LabSessions from './components/LabSessions';
import ManageLabAppointments from './components/ManageLabAppointments';
import TreatmentSessions from './components/TreatmentSessions'; 
import ManageTreatmentAppointments from './components/ManageTreatmentAppointments';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js'; // Import Elements provider
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe

// Load Stripe with your public key
const stripePromise = loadStripe('pk_test_51PFSlzRpw8vaDdMypqhR3unSrqswKo7QwWQzQkTsGfif5QnvD9VDtknFp0YWGfkKIiPwNNVZcv4ah61b1dkm8qbn00kvlfodaQ');

const App = () => {
  const [user, setUser] = useState(null);

  // Function to fetch user details if token is present
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data); // Set user data if the token is valid
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        localStorage.removeItem('token'); // Remove token if it's invalid
      }
    }
  };

  // Call fetchUser on component mount to check session
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      {!user ? (
        <Auth setUser={setUser} />
      ) : (
        <>
          <Navbar setUser={setUser} />
          <Routes>
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/report" element={<Report />} />

            {/* Wrap the components using Stripe in the Elements provider */}
            <Route path="/labs" element={
              <Elements stripe={stripePromise}>
                <LabSessions />
              </Elements>
            } />
            <Route path="/manage-labs" element={<ManageLabAppointments />} />

            <Route path="/treatments" element={<TreatmentSessions />} />
            <Route path="/manage-treatments" element={<ManageTreatmentAppointments />} />
          </Routes>
        </>
      )}
    </Router>
  );
};

export default App;
