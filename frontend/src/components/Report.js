// frontend/src/components/Report.js
import React, { useState } from 'react';
import axios from 'axios';

const Report = () => {
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    try {
      const response = await axios.get('/api/report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReport(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Generate Report</h2>
      <button onClick={generateReport}>Generate Report</button>

      {report && (
        <div>
          <h3>Report</h3>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Report;
