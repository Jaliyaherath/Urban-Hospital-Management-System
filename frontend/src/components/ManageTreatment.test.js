import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ManageTreatment from './ManageTreatment';

// Mock axios
jest.mock('axios');

// Mock window.alert
window.alert = jest.fn();

const mockTreatments = [
  {
    _id: '1',
    name: 'Treatment 1',
    description: 'Description 1',
    status: 'pending',
  },
  {
    _id: '2',
    name: 'Treatment 2',
    description: 'Description 2',
    status: 'completed',
  },
];

describe('ManageTreatment', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockTreatments });
  });

  test('renders ManageTreatment component', async () => {
    render(<ManageTreatment />);

    // Check if the title is rendered
    expect(screen.getByText('Manage Treatments')).toBeInTheDocument();

    // Wait for the treatments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Treatment 1')).toBeInTheDocument();
      expect(screen.getByText('Treatment 2')).toBeInTheDocument();
    });
  });

  test('deletes a treatment', async () => {
    axios.delete.mockResolvedValue({});

    render(<ManageTreatment />);

    // Wait for the treatments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Treatment 1')).toBeInTheDocument();
    });

    // Click the delete button for the first treatment
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for the treatment to be deleted
    await waitFor(() => {
      expect(screen.queryByText('Treatment 1')).not.toBeInTheDocument();
    });

    // Check if alert was called
    expect(window.alert).toHaveBeenCalledWith('Treatment deleted successfully');
  });

  test('updates treatment status', async () => {
    axios.put.mockResolvedValue({
      data: { ...mockTreatments[0], status: 'completed' },
    });

    render(<ManageTreatment />);

    // Wait for the treatments to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Treatment 1')).toBeInTheDocument();
    });

    // Click the update status button for the first treatment
    fireEvent.click(screen.getAllByText('Mark as Completed')[0]);

    // Wait for the treatment status to be updated
    await waitFor(() => {
      expect(screen.getByText(/Status: completed/i)).toBeInTheDocument();
    });
  });

  test('handles error when fetching treatments', async () => {
    axios.get.mockRejectedValue(new Error('Error fetching treatments'));

    render(<ManageTreatment />);

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error fetching treatments/i)).toBeInTheDocument();
    });
  });
});