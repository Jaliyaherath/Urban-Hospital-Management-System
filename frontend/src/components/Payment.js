import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cardElement = elements.getElement(CardElement);

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/payment', {
        paymentMethodId: paymentMethod.id,
        amount: 5000, // Amount in cents ($50)
      });

      setPaymentStatus(response.data.message);
    } catch (error) {
      console.error(error);
      setPaymentStatus('Payment failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg space-y-4 w-96"> {/* Increased width */}
      {/* Card Element */}
      <div className="border border-gray-300 p-4 rounded-md">
        <CardElement className="p-2" />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
      >
        Pay $50
      </button>

      {/* Payment Status Message */}
      {paymentStatus && (
        <p className={`text-center mt-4 ${paymentStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {paymentStatus}
        </p>
      )}
    </form>
  );
};

const Payment = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default Payment;
