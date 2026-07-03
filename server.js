const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log(err.name, ' ', err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    // ===== OLD MONGOOSE 5 OPTIONS =====
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // ===== MONGOOSE 9 =====
    // No options needed.
    // These behaviors are now the default and the
    // above options have been removed.
  })
  .then((con) => {
    console.log('DB connection successful');
  });
// console.log(process.env);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`app is listening at ${PORT}.........`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECION! shutting down......');
  server.close(() => {
    process.exit(1);
  });
});
