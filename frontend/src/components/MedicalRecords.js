import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]); // State to store medical records
  const [record, setRecord] = useState('');   // State to store the record text input
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  // const [successMessage, setSuccessMessage] = useState(''); // State for success message
  // const [errorMessage, setErrorMessage] = useState(''); // State for error message

  // Function to fetch medical records for the patient
  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medical-records/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Set token in headers
      });
      setRecords(response.data); // Set fetched records in state
    } catch (error) {
      console.error(error);
      toast.error('Error fetching medical records', { autoClose: 2000 });
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
    
    // Clear any previous alerts
    // setSuccessMessage('');
    // setErrorMessage('');

    const formData = new FormData();
    formData.append('record', record); // Append the text record
    formData.append('pdfUrl', pdfFile); // Append the selected PDF file

    try {
      await axios.post('http://localhost:5000/api/medical-records/add', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Set token in headers
          'Content-Type': 'multipart/form-data', // Ensure proper content type for file upload
        },
      });
      // setSuccessMessage('Medical record added successfully!'); // Set success message
      toast.success('Medical record added successfully', {autoClose: 1200});
      fetchRecords(); // Refresh the records list after adding a new record
      setRecord(''); // Clear form input
      setPdfFile(null); // Clear the file input
      
      // Automatically clear the error message after 5 seconds
      // setTimeout(() => {
      //   setSuccessMessage('');
      // }, 2000);

    } catch (error) {
      // setErrorMessage('Failed to add the medical record. Please try again.'); // Set error message
      //  // Automatically clear the error message after 5 seconds
      //  setTimeout(() => {
      //   setErrorMessage('');
      // }, 2000);
      toast.error('Failed to add the medical record', { autoClose: 1200 });
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Medical Record</h2>
      
      {/* Success Alert */}
      {/* {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">
          {successMessage}
        </div>
      )} */}

      {/* Error Alert */}
      {/* {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
          {errorMessage}
        </div>
      )} */}

      <form onSubmit={handleAddRecord} className="mb-8 space-y-4">
        {/* Textarea for the record */}
        <div>
          <label className="block text-gray-700 mb-2">Medical Record</label>
          <textarea
            value={record}
            onChange={(e) => setRecord(e.target.value)}
            placeholder="Enter medical record"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Input for selecting the PDF file */}
        <div>
          <label className="block text-gray-700 mb-2">Upload PDF</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange} 
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Record
        </button>
      </form>

      <h3 className="text-xl font-medium mb-4">Your Medical Records</h3>
      <ul className="space-y-4">
        {records.map((rec) => (
          <li key={rec._id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <p className="text-lg font-medium text-gray-800 mb-2">{rec.record}</p>
            <a
              href={rec.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View PDF
            </a>
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
};

export default MedicalRecords;
