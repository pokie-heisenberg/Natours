import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51TnfhJRXZDsKdZi4FiIc4RxlTQYDdnn6KkUBt3mfnKtZfx7j5J5RWEDgJBOn9dMXS2tsyeeE90yqvl4Lwfkq3ENA00LFl4t8r5'
);
export const bookTour = async (tourId) => {
  // 1. get session from the server
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/booking/checkout-session/${tourId}`,
    });
    // 2. create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
