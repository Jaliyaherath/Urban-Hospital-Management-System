import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Appointments from './Appointments';

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

const mockAppointments = [
  {
    _id: '1',
    lab: { name: 'Lab 1' },
    startTime: '2023-10-10T10:00',
    status: 'pending',
  },
  {
    _id: '2',
    lab: { name: 'Lab 2' },
    startTime: '2023-10-11T11:00',
    status: 'completed',
  },
];

describe('Appointments', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('fetches and displays appointments for staff/admin', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/me') {
        return Promise.resolve({ data: { role: 'staff' } });
      } else if (url === 'http://localhost:5000/api/labs/manage-appointments') {
        return Promise.resolve({ data: mockAppointments });
      }
    });

    render(<Appointments />);

    await waitFor(() => {
      expect(screen.getByText('Lab 1 - 2023-10-10T10:00 - pending')).toBeInTheDocument();
      expect(screen.getByText('Lab 2 - 2023-10-11T11:00 - completed')).toBeInTheDocument();
    });
  });

  test('fetches and displays appointments for regular user', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/me') {
        return Promise.resolve({ data: { role: 'user' } });
      } else if (url === 'http://localhost:5000/api/labs/my-appointments') {
        return Promise.resolve({ data: mockAppointments });
      }
    });

    render(<Appointments />);

    await waitFor(() => {
      expect(screen.getByText('Lab 1 - 2023-10-10T10:00 - pending')).toBeInTheDocument();
      expect(screen.getByText('Lab 2 - 2023-10-11T11:00 - completed')).toBeInTheDocument();
    });
  });

  test('displays error message when no token is available', async () => {
    localStorage.clear();

    render(<Appointments />);

    await waitFor(() => {
      expect(screen.getByText('No token available, please log in.')).toBeInTheDocument();
    });
  });

  test('displays error message when fetching appointments fails', async () => {
    axios.get.mockRejectedValue(new Error('Error fetching appointments'));

    render(<Appointments />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching appointments')).toBeInTheDocument();
    });
  });
});