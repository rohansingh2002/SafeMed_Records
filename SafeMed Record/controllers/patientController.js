const fs = require('fs');
const Patient = require('./../models/Patient');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const signToken = require('./../utils/signToken');
const ipfsMethods = require('./../ipfs/ipfsMethods');
const { getAllTicketsMethod, uploadDataMethod } = require('../onchainMethods/ticketMethods');
const filters = require('./../utils/filters');
const generateURLs = require('./../utils/generateURLs');
const formidable = require('formidable');
const { createRecordMethod, getRecords, grantAccess, revokeAccess, addFilesToRecord } = require('./../onchainMethods/recordMethods');

module.exports.register = catchAsync(async (req, res, next) => {
    const patient = await Patient.create(req.body);
    patient.password = undefined;
    const token = signToken(patient._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            patient
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
    const patient = await Patient.findOne({ aadhar }).select('+password');

    if (!patient || !(await patient.correctPassword(password, patient.password))) {
        return next(new AppError('Incorrect aadhar or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(patient._id);
    patient.password = undefined;
    res.status(200).json({
        status: 'success',
        token,
        data: {
            patient
        }
    });
});

module.exports.getAllTickets = catchAsync(async function (req, res, next) {
    let tickets = await getAllTicketsMethod({ id: req.user.aadhar, role: 'patient' });
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
        // const uri = await ipfsMethods(fs.readFileSync(files.document[0].filepath));
        // console.log(uri);

        const uri = await ipfsMethods.uploadUserDoc(fields.hash[0], files.document[0].filepath, files.document[0].originalFilename, "patient")
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

module.exports.createRecord = catchAsync(async function (req, res, next) {
    const file = await ipfsMethods.createRecordStorage();
    const obj = {
        patientAadhar: req.user.aadhar,
        description: req.body.description,
        date: req.body.date,
        file: file
    }
    const transactionHash = await createRecordMethod(obj);
    res.status(201).json({
        status: 'success',
        message: 'Record successfully created.',
        transactionHash: transactionHash
    })
})

module.exports.getRecords = catchAsync(async (req, res, next) => {
    const response = await getRecords({ aadhar: req.user.aadhar, role: "patient" });
    res.status(200).json({
        status: 'success',
        data: {
            records: response
        }
    })
})

module.exports.grantAccess = catchAsync(async function (req, res, next) {
    const transactionHash = await grantAccess({ recordId: req.body.recordId, doctorAadhar: req.body.doctorAadhar })
    res.status(200).json({
        status: 'success',
        message: "Access granted",
        transactionHash: transactionHash
    })
})

module.exports.revokeAccess = catchAsync(async function (req, res, next) {
    const transactionHash = await revokeAccess({ recordId: req.body.recordId, doctorAadhar: req.body.doctorAadhar })
    res.status(200).json({
        status: 'success',
        message: "Access revoked",
        transactionHash: transactionHash
    })
})

module.exports.uploadRecordFile = catchAsync(async function (req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error processing form data.' });
        }
        if (!(files.document)) {
            return res.status(404).json({ error: 'Please upload file.' });
        }
        const uri = await ipfsMethods.uploadUserRecord(fields.hash[0], files.document[0].filepath, files.document[0].originalFilename)
        console.log(uri);
        const transactionHash = await addFilesToRecord({ recordId: fields.recordId[0], file: uri })
        res.status(201).json({
            status: 'success',
            message: 'File uploaded successfully',
            transactionHash: transactionHash
        })
    });
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