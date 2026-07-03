import axios from 'axios';
import { showAlert } from './alert';
export const add_review = async (tourID, review, rating) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/tours/${tourID}/reviews`,
      data: {
        review,
        rating,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Review added successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
