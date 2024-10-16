import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ setUser }) => {
  const [role, setRole] = useState('');

  // Fetch user role from the backend
  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRole(response.data.role); // Set the role ('user', 'staff', or 'admin')
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    fetchRole();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {role === 'user' && (
        <>
          <Link to="/appointments">Appointments</Link>
          <Link to="/medical-records">Medical Records</Link>
          <Link to="/payment">Payment</Link>
          <Link to="/report">Report</Link>
          <Link to="/labs">Lab Sessions</Link>
          <Link to="/treatments">Treatment Sessions</Link>
        </>
      )}

      {(role === 'admin' || role === 'staff') && (
        <>
          <Link to="/appointments">Appointments</Link>
          <Link to="/medical-records">Medical Records</Link>
          <Link to="/payment">Payment</Link>
          <Link to="/report">Report</Link>
          <Link to="/labs">Lab Sessions</Link>
          <Link to="/manage-labs">Manage Lab Appointments</Link>
          <Link to="/treatments">Treatment Sessions</Link>
          <Link to="/manage-treatments">Manage Treatment Appointments</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
