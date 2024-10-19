import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TreatmentSession from './TreatmentSession';

// Mock axios
jest.mock('axios');

// Mock window.alert
window.alert = jest.fn();

const mockSessions = [
  {
    _id: '1',
    name: 'Session 1',
    description: 'Description 1',
    status: 'pending',
  },
  {
    _id: '2',
    name: 'Session 2',
    description: 'Description 2',
    status: 'completed',
  },
];

describe('TreatmentSession', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockSessions });
  });

  test('renders TreatmentSession component', async () => {
    render(<TreatmentSession />);

    // Check if the title is rendered
    expect(screen.getByText('Manage Treatment Sessions')).toBeInTheDocument();

    // Wait for the sessions to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
      expect(screen.getByText('Session 2')).toBeInTheDocument();
    });
  });

  test('deletes a session', async () => {
    axios.delete.mockResolvedValue({});

    render(<TreatmentSession />);

    // Wait for the sessions to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    // Click the delete button for the first session
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for the session to be deleted
    await waitFor(() => {
      expect(screen.queryByText('Session 1')).not.toBeInTheDocument();
    });

    // Check if alert was called
    expect(window.alert).toHaveBeenCalledWith('Session deleted successfully');
  });

  test('updates session status', async () => {
    axios.put.mockResolvedValue({
      data: { ...mockSessions[0], status: 'completed' },
    });

    render(<TreatmentSession />);

    // Wait for the sessions to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    // Click the update status button for the first session
    fireEvent.click(screen.getAllByText('Mark as Completed')[0]);

    // Wait for the session status to be updated
    await waitFor(() => {
      expect(screen.getByText(/Status: completed/i)).toBeInTheDocument();
    });
  });

  test('handles error when fetching sessions', async () => {
    axios.get.mockRejectedValue(new Error('Error fetching sessions'));

    render(<TreatmentSession />);

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error fetching sessions/i)).toBeInTheDocument();
    });
  });
});