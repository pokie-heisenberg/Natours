const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Aman yadav <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    console.log(`Current NODE_ENV is: "${process.env.NODE_ENV}"`);
    if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production') {
      //SendGrid
      console.log('Using SendGrid transport...');
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 2525,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    console.log('Using Mailtrap transport...');
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //Send the actual email
  async send(template, subject) {
    //1.)Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2.define email option
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    //3.create a tranport and send an email
    await this.newTransport().sendMail(mailOption);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }
  async sendPassworReset() {
    await this.send(
      'passwordReset',
      'Your password reset token is valid only for 10 min'
    );
  }
};
