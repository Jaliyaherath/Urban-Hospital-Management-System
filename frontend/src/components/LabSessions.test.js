import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LabSessions from './LabSessions';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Mock axios
jest.mock('axios');

// Mock window.alert
window.alert = jest.fn();

// Mock loadStripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    elements: jest.fn().mockReturnValue({
      getElement: jest.fn().mockReturnValue({
        mount: jest.fn(),
        destroy: jest.fn(),
      }),
    }),
    createPaymentMethod: jest.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_12345' },
    }),
  }),
}));

const stripePromise = loadStripe('pk_test_12345');

describe('LabSessions', () => {
  test('books an appointment with payment', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Appointment booked successfully' } });

    render(
      <Elements stripe={stripePromise}>
        <LabSessions />
      </Elements>
    );

    // Simulate user actions to book an appointment
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '2023-10-10T10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '2023-10-10T11:00' } });
    fireEvent.click(screen.getByText(/Confirm Booking & Pay/i));

    // Wait for the booking request to be sent and the alert to be displayed
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/labs/book-with-payment',
        {
          labId: expect.any(String),
          startTime: '2023-10-10T10:00',
          endTime: '2023-10-10T11:00',
          paymentMethodId: 'pm_12345',
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      expect(window.alert).toHaveBeenCalledWith('Appointment booked and payment successful');
    });
  });
});