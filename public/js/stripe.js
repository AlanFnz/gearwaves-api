/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51HgTAYCuHAMb5OfDjRRxP8Mjcpgu52Eb15C7oTtdwP3YhKl8f8t0xspX877HHTAWO6PopXbTklvWsaNxwqliv5io00hAE9PR3F');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from the backend
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    // 2) Create checkout form + charge
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  };
};