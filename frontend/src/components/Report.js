import React, { useState } from 'react';
import axios from 'axios';

const Report = () => {
  const [report, setReport] = useState(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false); // New state for report generation

  const generateReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReport(response.data);
      setIsReportGenerated(true); // Update state to indicate report is generated
    } catch (error) {
      console.error(error);
    }
  };

  const printReport = () => {
    window.print();
  };

  // New function to handle canceling the report
  const cancelReport = () => {
    setReport(null); // Reset the report
    setIsReportGenerated(false); // Hide the report display and show the button again
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mt-5">
        {/* Conditionally render heading and buttons */}
        {!isReportGenerated && (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6 no-print">Generate Report</h2>

            {/* Button to generate report */}
            <button
              onClick={generateReport}
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors mb-4 no-print"
            >
              Generate Report
            </button>
          </>
        )}

        {/* Report display */}
        {report && (
          <div className="mt-8 bg-gray-50 p-4 rounded-md shadow-inner" id="reportTable">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Report</h3>
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100 transition-colors">
                  <td className="border border-gray-300 px-4 py-2">Total Appointments</td>
                  <td className="border border-gray-300 px-4 py-2">{report.totalAppointments}</td>
                </tr>
                <tr className="hover:bg-gray-100 transition-colors">
                  <td className="border border-gray-300 px-4 py-2">Total Medical Records</td>
                  <td className="border border-gray-300 px-4 py-2">{report.totalMedicalRecords}</td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-700" colSpan="2">
                    Appointments By Hospital
                  </th>
                </tr>
                {report.appointmentsByHospital.map((hospital) => (
                  <tr key={hospital._id} className="hover:bg-gray-100 transition-colors">
                    <td className="border border-gray-300 px-4 py-2">{hospital._id}</td>
                    <td className="border border-gray-300 px-4 py-2">{hospital.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={printReport}
              className="w-full bg-yellow-500 text-white py-3 rounded-md hover:bg-yellow-600 transition-colors mt-4 no-print"
            >
              Print Report
            </button>
            {/* Cancel button to reset the report display */}
            <button
              onClick={cancelReport}
              className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors mt-2 no-print"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
