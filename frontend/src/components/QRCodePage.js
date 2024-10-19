import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate, useLocation } from 'react-router-dom';

const QRCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrCode } = location.state || {};

  const handleContinue = () => {
    navigate('/home');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-700">Your QR Code</h2>
        {qrCode && <QRCodeCanvas value={qrCode} size={256} />}
        <button
          onClick={handleContinue}
          className="mt-4 py-2 px-4 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default QRCodePage;