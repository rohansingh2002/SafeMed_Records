const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const signToken = require('./../utils/signToken');
const Diagnostic = require('../models/Diagnostic');
const { getAllTicketsMethod, uploadDataMethod } = require('../onchainMethods/ticketMethods');
const ipfsMethods = require('./../ipfs/ipfsMethods');
const formidable = require('formidable');
const filters = require('./../utils/filters');
const generateURLs = require('./../utils/generateURLs');

module.exports.register = catchAsync(async (req, res, next) => {
    const diagnostic = await Diagnostic.create(req.body);
    diagnostic.password = undefined;
    const token = signToken(diagnostic._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            diagnostic
        }
    });
});

module.exports.login = catchAsync(async (req, res, next) => {
    const { diagnosticId, password } = req.body;

    // 1) Check if email and password exist
    if (!diagnosticId || !password) {
        return next(new AppError('Please provide diagnosticId and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const diagnostic = await Diagnostic.findOne({ diagnosticId }).select('+password');

    if (!diagnostic || !(await diagnostic.correctPassword(password, diagnostic.password))) {
        return next(new AppError('Incorrect diagnosticId or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(diagnostic._id);
    diagnostic.password = undefined;
    res.status(200).json({
        status: 'success',
        token,
        data: {
            diagnostic
        }
    });
});

module.exports.getAllTickets = catchAsync(async function (req, res, next) {
    let tickets = await getAllTicketsMethod({ id: req.user.diagnosticId, role: 'diagnostic' });
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

        const uri = await ipfsMethods.uploadUserDoc(fields.hash[0], files.document[0].filepath, files.document[0].originalFilename, "diagnostic")
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