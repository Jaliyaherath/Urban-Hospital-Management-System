import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]); // State to store medical records
  const [record, setRecord] = useState('');   // State to store the record text input
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file

  // Function to fetch medical records for the patient
  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/medical-records/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Set token in headers
      });
      setRecords(response.data); // Set fetched records in state
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch records when the component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]); // Store selected file in state
  };

  // Handle form submission to add a medical record
  const handleAddRecord = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('record', record); // Append the text record
    formData.append('pdfFile', pdfFile); // Append the selected PDF file

    try {
      await axios.post('/api/medical-records/add', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Set token in headers
          'Content-Type': 'multipart/form-data', // Ensure proper content type for file upload
        },
      });
      fetchRecords(); // Refresh the records list after adding a new record
    } catch (error) {
      console.error(error); // Log error if any
    }
  };

  return (
    <div>
      <h2>Add Medical Record</h2>
      <form onSubmit={handleAddRecord}>
        {/* Textarea for the record */}
        <textarea
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          placeholder="Enter medical record"
          required
        />
        {/* Input for selecting the PDF file */}
        <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        <button type="submit">Add Record</button>
      </form>

      <h3>Your Medical Records</h3>
      <ul>
        {records.map((rec) => (
          <li key={rec._id}>
            {rec.record} -{' '}
            {/* Link to view the PDF file */}
            <a href={rec.pdfUrl} target="_blank" rel="noopener noreferrer">
              View PDF
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicalRecords;