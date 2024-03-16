const jwt = require("jsonwebtoken");
const Hospital = require('./../models/Hospital');
const Patient = require('./../models/Patient');
const Doctor = require('./../models/Doctor');
const Diagnostic = require('./../models/Diagnostic');

exports.isAuthenticatedUser = async (req, res, next) => {
    const token = req.body.token || req.headers.token;

    if (!token) return res.status(401).send({
        message: "Please Login to access this resource"
    })
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user ??= await Patient.findById(decodedData.id);
    req.user ??= await Doctor.findById(decodedData.id);
    req.user ??= await Hospital.findById(decodedData.id);
    req.user ??= await Diagnostic.findById(decodedData.id);

    if (req.user instanceof Hospital) {
        req.role = 'Hospital';
    } else if (req.user instanceof Doctor) {
        req.role = 'Doctor';
    } else if (req.user instanceof Patient) {
        req.role = 'Patient';
    }
    else if (req.user instanceof Diagnostic) {
        req.role = 'Diagnostic';
    }
    else {
        return res.status(401).send({
            message: "Invalid Role"
        })
    }
    next();
};