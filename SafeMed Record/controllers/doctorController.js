const Doctor = require('./../models/Doctor');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const signToken = require('./../utils/signToken');
const { getAllTicketsMethod, uploadDataMethod } = require('../onchainMethods/ticketMethods');
const ipfsMethods = require('./../ipfs/ipfsMethods');
const formidable = require('formidable');
const filters = require('./../utils/filters');
const generateURLs = require('./../utils/generateURLs');
const { getRecords } = require('./../onchainMethods/recordMethods')

module.exports.register = catchAsync(async (req, res, next) => {
    const doctor = await Doctor.create(req.body);
    doctor.password = undefined;
    const token = signToken(doctor._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            doctor
        }
    });
});

module.exports.login = catchAsync(async (req, res, next) => {
    const { aadhar, password } = req.body;

    // 1) Check if email and password exist
    if (!aadhar || !password) {
        return next(new AppError('Please provide aadhar and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const doctor = await Doctor.findOne({ aadhar }).select('+password');

    if (!doctor || !(await doctor.correctPassword(password, doctor.password))) {
        return next(new AppError('Incorrect aadhar or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(doctor._id);
    doctor.password = undefined;
    res.status(200).json({
        status: 'success',
        token,
        data: {
            doctor
        }
    });
});

module.exports.getAllTickets = catchAsync(async function (req, res, next) {
    let tickets = await getAllTicketsMethod({ id: req.user.aadhar, role: 'doctor' });
    tickets = req.query ? filters(tickets, req.query) : tickets;
    res.status(200).json({
        status: 'success',
        data: {
            length: tickets.length,
            tickets
        }
    });
})

module.exports.uploadFile = catchAsync(async function (req, res, next) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error processing form data.' });
        }
        if (!(files.document)) {
            return res.status(404).json({ error: 'Please upload file.' });
        }

        const uri = await ipfsMethods.uploadUserDoc(fields.hash[0], files.document[0].filepath, files.document[0].originalFilename, "doctor")
        console.log(uri);
        const transactionHash = await uploadDataMethod({ ticketId: fields.ticketId[0], newHash: uri })
        res.status(201).json({
            status: 'success',
            message: 'File uploaded successfully',
            transactionHash: transactionHash
        })
    });
})

module.exports.getFiles = catchAsync(async function (req, res, next) {
    const hash = req.headers.hash;
    const data = await ipfsMethods.getUserDocs(hash);
    const files = await generateURLs(data)
    res.status(200).json({
        status: 'success',
        data: {
            files
        }
    })
})

module.exports.getRecords = catchAsync(async (req, res, next) => {
    const response = await getRecords({ aadhar: req.user.aadhar, role: "doctor" });
    res.status(200).json({
        status: 'success',
        data: {
            records: response
        }
    })
})

module.exports.getRecordFiles = catchAsync(async function (req, res, next) {
    const hash = req.headers.hash;
    const data = await ipfsMethods.getUserDocs(hash);
    const files = data.files;
    for (let i = 0; i < files.length; i++) {
        files[i].hash = `https://ipfs.io/ipfs/${files[i].hash.substring(7)}`
    }
    console.log(data);
    res.status(200).json({
        status: 'success',
        data: {
            files
        }
    })
})