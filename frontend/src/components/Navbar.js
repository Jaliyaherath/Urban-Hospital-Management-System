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
    <nav className="bg-white shadow-lg no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <Link to="/" className="hover:text-blue-600 transition-colors">HealthCare</Link>
        </div>

        {/* Links based on role */}
        <div className="flex space-x-6">
          {role === 'user' && (
            <>
              <Link to="/appointments" className="hover:text-blue-500 text-gray-600">Appointments</Link>
              <Link to="/medical-records" className="hover:text-blue-500 text-gray-600">Medical Records</Link>
              <Link to="/payment" className="hover:text-blue-500 text-gray-600">Payment</Link>
              <Link to="/report" className="hover:text-blue-500 text-gray-600">Report</Link>
              <Link to="/labs" className="hover:text-blue-500 text-gray-600">Lab Sessions</Link>
              <Link to="/treatments" className="hover:text-blue-500 text-gray-600">Treatment Sessions</Link>
            </>
          )}

          {(role === 'admin' || role === 'staff') && (
            <>
              <Link to="/appointments" className="hover:text-blue-500 text-gray-600">Appointments</Link>
              <Link to="/medical-records" className="hover:text-blue-500 text-gray-600">Medical Records</Link>
              <Link to="/payment" className="hover:text-blue-500 text-gray-600">Payment</Link>
              <Link to="/report" className="hover:text-blue-500 text-gray-600">Report</Link>
              <Link to="/labs" className="hover:text-blue-500 text-gray-600">Lab Sessions</Link>
              <Link to="/manage-labs" className="hover:text-blue-500 text-gray-600">Manage Labs</Link>
              <Link to="/treatments" className="hover:text-blue-500 text-gray-600">Treatment Sessions</Link>
              <Link to="/manage-treatments" className="hover:text-blue-500 text-gray-600">Manage Treatments</Link>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
