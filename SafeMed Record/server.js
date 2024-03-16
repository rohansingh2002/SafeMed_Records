const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    console.log(err)
    process.exit(1);
});

dotenv.config();
const app = require('./app');

mongoose
    .connect(process.env.DB_URI)
    .then((data) => console.log(`Mongodb connected with server: ${data.connection.host}`))
    .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
const IP = "192.168.0.101"
const server = app.listen(PORT, () => {
    console.log(`App running on port http://${IP}:${PORT}...`);
});