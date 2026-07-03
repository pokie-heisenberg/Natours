# Natours Application 🌲

Welcome to **Natours**! This is a modern, full-stack Node.js web application built for booking nature tours. 

This project was built as part of an advanced Node.js bootcamp and serves as a comprehensive backend REST API and server-side rendered website.

## 🚀 Features

### Backend / API
*   **RESTful API** built with **Node.js** and **Express**.
*   **MongoDB** database using **Mongoose** for data modeling.
*   **Authentication & Authorization:**
    *   Sign up, log in, password reset, and update password functionality.
    *   Stateless authentication using **JSON Web Tokens (JWT)**.
    *   Role-based permissions (User, Guide, Lead-Guide, Admin).
*   **Advanced Features:**
    *   Geospatial queries (finding tours within a certain radius).
    *   Advanced API filtering, sorting, limiting, and pagination.
    *   Aggregation pipelines for calculating statistics.
*   **Security:**
    *   Encryption using `bcrypt`.
    *   Protection against NoSQL query injection and XSS attacks.
    *   Rate limiting to prevent brute-force attacks.
    *   HTTP parameter pollution prevention.
    *   Secure HTTP headers using `helmet`.

### Frontend / Integrations
*   **Server-Side Rendering (SSR)** using the **Pug** template engine.
*   **Interactive Maps:** Displaying tour locations using Mapbox/Leaflet.
*   **Credit Card Payments:** Fully integrated checkout sessions using **Stripe**.
*   **Emails:** Sending welcome emails and password reset emails using **Nodemailer** and **SendGrid**.
*   **File Uploads:** Uploading and resizing user avatars and tour images using `multer` and `sharp`.

## 🛠️ Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express
*   **Database:** MongoDB & Mongoose
*   **Template Engine:** Pug
*   **Authentication:** JWT, bcrypt
*   **Payments:** Stripe
*   **Mailing:** Nodemailer, SendGrid
*   **Bundler:** Parcel

## 💻 Running the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine. You will also need a MongoDB database (either local or MongoDB Atlas).

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
You need to create a `config.env` file in the root directory. Because this file contains sensitive passwords and API keys, it is ignored by Git.

Create a `config.env` file and add the following template (you will need to fill in your own credentials):
```env
NODE_ENV=development
PORT=3000

# Database
DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_mongodb_password

# Authentication
JWT_SECRET=your_ultra_secure_and_ultra_long_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration (e.g., Mailtrap for testing, SendGrid for prod)
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Start the Application
To run the development server (uses `nodemon` for hot-reloading):
```bash
npm run start:dev
```
The server should now be running on `http://localhost:3000`.

## 👤 Author
**Aman Yadav**
