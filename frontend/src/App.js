import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage'; // Import the new HomePage component
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Payment from './components/Payment';
import Report from './components/Report';
import LabSessions from './components/LabSessions';
import ManageLabAppointments from './components/ManageLabAppointments';
import TreatmentSessions from './components/TreatmentSessions'; 
import ManageTreatmentAppointments from './components/ManageTreatmentAppointments';
import QRCodePage from './components/QRCodePage';
import Footer from './components/Footer';  // Import Footer component
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PFSlzRpw8vaDdMypqhR3unSrqswKo7QwWQzQkTsGfif5QnvD9VDtknFp0YWGfkKIiPwNNVZcv4ah61b1dkm8qbn00kvlfodaQ');

const App = () => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        localStorage.removeItem('token');
      }
    }
  };

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
          <div className="flex-grow">  {/* Ensure content takes available space */}
            <Routes>
              <Route path="/" element={<HomePage />} /> {/* Set HomePage as the root */}
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/report" element={<Report />} />
              <Route path="/labs" element={
                <Elements stripe={stripePromise}>
                  <LabSessions />
                </Elements>
              } />
              <Route path="/manage-labs" element={<ManageLabAppointments />} />
              <Route path="/treatments" element={<TreatmentSessions />} />
              <Route path="/manage-treatments" element={<ManageTreatmentAppointments />} />
              <Route path="/qr-code" element={<QRCodePage />} />
            </Routes>
          </div>

          {/* Footer section */}
          <Footer />
        </>
      )}
    </Router>
  );
};

export default App;
