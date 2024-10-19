import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MedicalRecords from './MedicalRecords';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('MedicalRecords', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('adds a medical record successfully', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Medical record added successfully' } });

    render(<MedicalRecords />);

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText('Enter medical record'), { target: { value: 'Test record' } });
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/file/i), { target: { files: [file] } });

    // Simulate form submission
    fireEvent.click(screen.getByText('Add Record'));

    // Wait for the request to be sent and the success message to be displayed
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/medical-records',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer test-token',
          },
        }
      );
      expect(screen.getByText('Medical record added successfully')).toBeInTheDocument();
    });
  });

  test('displays error message when adding a medical record fails', async () => {
    axios.post.mockRejectedValue(new Error('Failed to add medical record'));

    render(<MedicalRecords />);

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText('Enter medical record'), { target: { value: 'Test record' } });
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/file/i), { target: { files: [file] } });

    // Simulate form submission
    fireEvent.click(screen.getByText('Add Record'));

    // Wait for the request to be sent and the error message to be displayed
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/medical-records',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer test-token',
          },
        }
      );
      expect(screen.getByText('Failed to add medical record')).toBeInTheDocument();
    });
  });
});