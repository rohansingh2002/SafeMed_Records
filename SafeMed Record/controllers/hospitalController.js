const Hospital = require('./../models/Hospital');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const signToken = require('./../utils/signToken');
const Doctor = require('./../models/Doctor');
const Patient = require('./../models/Patient');
const Diagnostic = require('./../models/Diagnostic');
const ipfsMethods = require('./../ipfs/ipfsMethods');
const formidable = require('formidable')
const filters = require('./../utils/filters')
const generateURLs = require('./../utils/generateURLs');

const { createTicketMethod, getAllTicketsMethod, uploadDataMethod } = require('./../onchainMethods/ticketMethods');

module.exports.register = catchAsync(async (req, res, next) => {
    const hospital = await Hospital.create(req.body);
    hospital.password = undefined;
    const token = signToken(hospital._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            hospital
        }
    });
});

module.exports.login = catchAsync(async (req, res, next) => {
    const { hospitalId, password } = req.body;

    // 1) Check if email and password exist
    if (!hospitalId || !password) {
        return next(new AppError('Please provide hospitalId and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const hospital = await Hospital.findOne({ hospitalId }).select('+password -doctors -diagnostics');

    if (!hospital || !(await hospital.correctPassword(password, hospital.password))) {
        return next(new AppError('Incorrect hospitalId or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(hospital._id);
    hospital.password = undefined;
    res.status(200).json({
        status: 'success',
        token,
        data: {
            hospital
        }
    });
});

module.exports.addDoctor = catchAsync(async function (req, res, next) {
    const { doctorAadhar } = req.body;
    const doctor = await Doctor.findOne({ aadhar: doctorAadhar }, '_id');
    const hospital = req.user;
    if (!doctor) {
        res.status(404).json({
            message: "Doctor not found."
        })
    }
    const length = hospital.doctors.length;
    const updatedHospital = await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { $addToSet: { doctors: doctor._id } },
        { new: true }
    );
    if (length == updatedHospital.doctors.length) {
        res.status(409).json({
            message: "Doctor already exists"
        })
    }
    res.status(201).json({
        status: 'success'
    });
});

module.exports.addDiagnostic = catchAsync(async function (req, res, next) {
    const { diagnosticId } = req.body;
    const diagnostic = await Diagnostic.findOne({ diagnosticId: diagnosticId }, '_id');
    const hospital = req.user;
    if (!diagnostic) {
        res.status(404).json({
            message: "Diagnostic not found."
        })
        return;
    }
    const length = hospital.diagnostics.length;
    const updatedHospital = await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { $addToSet: { diagnostics: diagnostic._id } },
        { new: true }
    );
    if (length == updatedHospital.diagnostics.length) {
        res.status(409).json({
            message: "Diagnostic already exists"
        })
        return;
    }
    res.status(201).json({
        status: 'success'
    });
});

module.exports.getAllDiagnostics = catchAsync(async function (req, res) {
    const hospital = req.user;
    const obj = await Hospital.findById(hospital._id).populate('diagnostics');
    res.status(200).json({
        status: 'success',
        data: {
            diagnostics: obj.diagnostics
        }
    });
})

module.exports.getAllDoctors = catchAsync(async function (req, res) {
    const hospital = req.user;
    const obj = await Hospital.findById(hospital._id).populate('doctors');
    res.status(200).json({
        status: 'success',
        data: {
            doctors: obj.doctors
        }
    });
})

module.exports.createTicket = catchAsync(async function (req, res, next) {
    const hospital = req.user;
    if (req.role !== "Hospital") {
        res.status(404).json({
            status: "Failed",
            message: "Unauthorized Request"
        })
        return;
    }
    const { patientAadhar, doctorAadhar, diagnosticId, description } = req.body;
    const patientExists = await Patient.exists({ aadhar: patientAadhar });
    const doctorExists = await Doctor.exists({ aadhar: doctorAadhar });
    const diagnosticExists = await Diagnostic.exists({ diagnosticId: diagnosticId });
    if (!patientExists) {
        res.status(404).json({
            status: "Failed",
            message: "Patient does not exists"
        })
        return;
    }
    if (!doctorExists) {
        res.status(404).json({
            status: "Failed",
            message: "Doctor does not exists"
        })
        return;
    }
    if (!diagnosticExists) {
        res.status(404).json({
            status: "Failed",
            message: "Diagnostic does not exists"
        })
        return;
    }

    const hospitalId = hospital.hospitalId;
    const ipfsHash = await ipfsMethods.createTicketStorage();
    const obj = {
        _patientAadhar: patientAadhar,
        _doctorAadhar: doctorAadhar,
        _diagnosticId: diagnosticId,
        _hospitalId: hospitalId,
        _ipfsHash: ipfsHash,
        _description: description
    }
    const transactionHash = await createTicketMethod(obj)
    if (transactionHash) {
        res.status(201).json({
            status: 'success',
            message: 'Ticket created successfully',
            transactionHash: transactionHash
        });
        return;
    }
    res.status(400).json({
        status: 'failed',
        message: 'Something is not right',
    });
})

module.exports.getAllTickets = catchAsync(async function (req, res, next) {
    let tickets = await getAllTicketsMethod({ id: req.user.hospitalId, role: 'hospital' });
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

        const uri = await ipfsMethods.uploadUserDoc(fields.hash[0], files.document[0].filepath, files.document[0].originalFilename, "hospital")
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