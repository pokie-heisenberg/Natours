const { promisify } = require('util');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncError = require('./../utils/catchAsyncError');
const appError = require('./../utils/appError');
const crypto = require('crypto');
const JWT = require('jsonwebtoken');
const User = require('./../models/userModels');
const Email = require('./../utils/email');
const signUpToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signUpToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if email and password exist or not
  if (!email || !password)
    return next(new appError('please provide password and email', 400));
  //2) check user exist or password is correct;
  const user = await User.findOne({ email }).select('+password');
  const correct = user
    ? await user.correctPassword(password, user.password)
    : false;
  if (!user || !correct) {
    return next(new appError('Incorrect Password or email', 401));
  }
  //)send webtoken to client for login;
  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = catchAsyncError(async (req, res, next) => {
  //1.)getting the token and check whether it exist or not.(present in http header).
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return next(new appError('You are not logged in!,Please logged in', 401));
  }
  //2.verification of token
  const decode = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  //3.check if user still exist
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new appError('The user belonging to this token is no longer exist', 401)
    );
  }
  //4.check if user changed password after the token was inssued.
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new appError('User recently changed Password,Please login again!', 401)
    );
  }
  res.locals.user = currentUser;
  req.user = currentUser;
  //ACCESS GRANTED!!!!!!
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decode = await promisify(JWT.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3.check if user still exist
      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return next();
      }
      //4.check if user changed password after the token was inssued.
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next();
      }
      // there is user
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You don't have permission to perform this action!", 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  //1.get the user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('There is no user with this email address', 404));
  }
  //2.genrate random reset token;
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3. send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token only valid gor 10min!',
    //   message,
    // });
    await new Email(user, resetURL).sendPassworReset();
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new appError('there was an error sending the email.try again later', 500)
    );
  }
});
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //1.get user based on token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  //2.if token is not expired,and there is user , set the new password;
  if (!user) {
    return next(
      new appError('token is invalid or has been expired,Try again', 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3.Update the changedPasswordAt property.------>userModels middleware
  //4.log in user in , send JWT token
  createSendToken(user, 201, res);
});
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  //1.get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2. check whether posted password is correct or not.
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new appError('password is incorrect!,Try again', 400));
  }
  //3.update the password.
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmNewPassword;
  await user.save();
  //findbyIdand Upadte would not work because moogose validator will not run!.
  //4.login user
  createSendToken(user, 201, res);
});
