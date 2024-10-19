import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ManageLabAppointments from './ManageLabAppointments';

// Mock axios
jest.mock('axios');

// Mock window.alert
window.alert = jest.fn();

const mockAppointments = [
  {
    _id: '1',
    lab: { name: 'Lab 1' },
    user: { name: 'User 1' },
    totalPrice: 100,
    status: 'pending',
  },
  {
    _id: '2',
    lab: { name: 'Lab 2' },
    user: { name: 'User 2' },
    totalPrice: 200,
    status: 'pending',
  },
];

describe('ManageLabAppointments', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockAppointments });
  });

  test('renders ManageLabAppointments component', async () => {
    render(<ManageLabAppointments />);

    // Check if the title is rendered
    expect(screen.getByText('Manage Lab Appointments')).toBeInTheDocument();

    // Wait for the appointments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Lab 1')).toBeInTheDocument();
      expect(screen.getByText('Lab 2')).toBeInTheDocument();
    });
  });

  test('deletes an appointment', async () => {
    axios.delete.mockResolvedValue({});

    render(<ManageLabAppointments />);

    // Wait for the appointments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Lab 1')).toBeInTheDocument();
    });

    // Click the delete button for the first appointment
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for the appointment to be deleted
    await waitFor(() => {
      expect(screen.queryByText('Lab 1')).not.toBeInTheDocument();
    });

    // Check if alert was called
    expect(window.alert).toHaveBeenCalledWith('Appointment deleted successfully');
  });

  test('updates appointment status', async () => {
    axios.put.mockResolvedValue({
      data: { ...mockAppointments[0], status: 'completed' },
    });

    render(<ManageLabAppointments />);

    // Wait for the appointments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Lab 1')).toBeInTheDocument();
    });

    // Click the update status button for the first appointment
    fireEvent.click(screen.getAllByText('Mark as Completed')[0]);

    // Wait for the appointment status to be updated
    await waitFor(() => {
      expect(screen.getByText(/Status: completed/i)).toBeInTheDocument();
    });
  });

  test('handles error when fetching appointments', async () => {
    axios.get.mockRejectedValue(new Error('Error fetching appointments'));

    render(<ManageLabAppointments />);

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error fetching appointments/i)).toBeInTheDocument();
    });
  });
});