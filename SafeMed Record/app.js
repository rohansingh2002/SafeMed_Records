const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
// Routes Imports
const patientRouter = require('./routes/patientRouter');
const doctorRouter = require('./routes/doctorRouter');
const hospitalRouter = require('./routes/hospitalRouter');
const diagnosticRouter = require('./routes/diagnosticRouter');
const globalErrorHandler = require('./controllers/errorController')

const app = express();

app.use(cors());
// Set security HTTP headers
app.use(helmet());
app.use(morgan('dev'));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());


app.get('/', (req, res) => { res.send("Server is Working Fine.") });
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/hospital', hospitalRouter);
app.use('/api/v1/diagnostic', diagnosticRouter);

app.use(globalErrorHandler)

module.exports = app;