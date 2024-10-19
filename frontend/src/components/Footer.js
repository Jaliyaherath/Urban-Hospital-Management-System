// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div>
          <h3 className="font-bold text-lg mb-4">Digital Health Agency</h3>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:underline">About us</a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">Careers</a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">Contact us</a>
            </li>
            <li>
              <a href="#" className="hover:underline">Newsroom</a>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="font-bold text-lg mb-4">Digital health for healthcare providers</h3>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:underline">Digital health for healthcare providers</a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">Developer Portal</a>
            </li>
            <li>
              <a href="#" className="hover:underline">National Clinical Terminology Service</a>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="font-bold text-lg mb-4">Initiatives and programs</h3>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:underline">My Health Record</a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">Electronic prescriptions</a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline">Telehealth</a>
            </li>
            <li>
              <a href="#" className="hover:underline">More digital health tools</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="mt-12 border-t border-blue-800 pt-6 text-center text-sm">
        <p>© 2024 Created By WE_Y3_S2_SE_12. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
