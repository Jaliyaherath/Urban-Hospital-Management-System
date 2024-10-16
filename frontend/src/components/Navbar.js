// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ setUser }) => {
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/appointments">Appointments</Link>
      <Link to="/medical-records">Medical Records</Link>
      <Link to="/payment">Payment</Link>
      <Link to="/report">Report</Link>
      <Link to="/labs">Lab Sessions</Link>
      <Link to="/manage-labs">Manage Lab Appointments</Link>
      <Link to="/treatments">Treatment Sessions</Link>
      <Link to="/manage-treatments">Manage Treatment Appointments</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
