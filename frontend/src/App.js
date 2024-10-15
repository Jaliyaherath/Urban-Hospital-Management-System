// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Payment from './components/Payment';
import Report from './components/Report';
import axios from 'axios';

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
          </Routes>
        </>
      )}
    </Router>
  );
};

export default App;
