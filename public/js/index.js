import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateUserData } from './updateSetting';
import { signup } from './signup';
import { sendForgotPasswordLink } from './forgotPasword';
import { resetPassword } from './resetPassword';
import { add_review } from './addReview';
import { bookTour } from './stripe';
import { showAlert } from './alert';
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const signUpForm = document.querySelector('.form--signup');
const ForgotPasswordForm = document.querySelector('.form--forgot-password');
const ResetPaasswordForm = document.querySelector('.form--reset-password');
const submitReview = document.querySelector('.form--add-review');
const btnAddReview = document.getElementById('btn-add-review');
const reviewModal = document.getElementById('review-modal');
const btnCloseModal = document.getElementById('close-review-modal');
const bookBtn = document.querySelector('#book-tour');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateUserData(form, 'data');
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const confirmNewPassword =
      document.querySelector('#password-confirm').value;
    updateUserData({ password, newPassword, confirmNewPassword }, 'password');
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}
if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}
if (ForgotPasswordForm) {
  ForgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    sendForgotPasswordLink(email);
  });
}
if (ResetPaasswordForm) {
  ResetPaasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;
    const token = window.location.pathname.split('/')[2];
    resetPassword(password, passwordConfirm, token);
  });
}
if (btnAddReview) {
  btnAddReview.addEventListener('click', () => {
    reviewModal.classList.remove('hidden');
  });
}

if (btnCloseModal) {
  btnCloseModal.addEventListener('click', () => {
    reviewModal.classList.add('hidden');
  });
}

if (reviewModal) {
  reviewModal.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
      reviewModal.classList.add('hidden');
    }
  });
}

if (submitReview) {
  submitReview.addEventListener('submit', (e) => {
    e.preventDefault();
    const review = document.querySelector('#review').value;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const tourId = submitReview.dataset.tourId;
    add_review(tourId, review, rating);
  });
}
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
// Prevent back-forward cache (bfcache) issues
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});
