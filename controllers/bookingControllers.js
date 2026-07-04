const catchAsyncError = require('./../utils/catchAsyncError');
const appError = require('./../utils/appError');
const Tour = require('./../models/tourModels');
const Booking = require('../models/bookingModels');
const factoryFunction = require('./factoryFunction');
const User = require('../models/userModels');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getCheckoutSession = catchAsyncError(async (req, res, next) => {
  //1.get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  //2.create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    // success_url: `${req.protocol}://${req.get('host')}/?user=${req.user.id}&tour=${req.params.tourId}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });
  //3.send res and session
  res.status(200).json({
    status: 'success',
    session,
  });
});
// exports.createBookingCheckout = catchAsyncError(async (req, res, next) => {
//   const { user, tour, price } = req.query;
//   if (!user && !tour && !price) return next();
//   await Booking.create({ user, tour, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ user, tour, price });
};
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhhok error:${err.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);
  res.status(200).json({
    received: true,
  });
};
exports.getAllBooking = factoryFunction.getAll(Booking);
exports.getOneBooking = factoryFunction.getOne(Booking);
exports.createBooking = factoryFunction.createOne(Booking);
exports.deleteBooking = factoryFunction.deleteOne(Booking);
exports.updateBooking = factoryFunction.updateOne(Booking);
