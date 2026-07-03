import axios from 'axios';
import { showAlert } from './alert';
export const sendForgotPasswordLink = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', `Email send to ${email}`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
