const Patient = require('./../models/Patient');
const Doctor = require('./../models/Doctor');
const Hospital = require('./../models/Hospital');
const Diagnostic = require('./../models/Diagnostic');

module.exports.populateNames = async function (response) {
    const newResponse = await Promise.all(response.map(async (obj) => {
        const patientAadhar = obj.patientAadhar;
        const doctorAadhar = obj.doctorAadhar;
        const diagnosticId = obj.diagnosticId;
        const hospitalId = obj.hospitalId;

        const patient = await Patient.findOne({ aadhar: patientAadhar }).select('name');
        const doctor = await Doctor.findOne({ aadhar: doctorAadhar }).select('name');
        const hospital = await Hospital.findOne({ hospitalId: hospitalId }).select('name');
        const diagnostic = await Diagnostic.findOne({ diagnosticId: diagnosticId }).select('name');

        return {
            ticketId: obj.ticketId,
            patientName: patient?.name || 'Unknown',
            doctorName: doctor?.name || 'Unknown',
            hospitalName: hospital?.name || 'Unknown',
            diagnosticName: diagnostic?.name || 'Unknown',
            date: obj.date,
            description: obj.description,
            hash: obj.hash.slice(7)
        };
    }));

    return newResponse;
};

module.exports.getNames = async function (viewers) {
    const names = await Promise.all(await viewers.map(async (doctorAadhar) => {
        doctorAadhar = doctorAadhar.toString();
        const doctor = await Doctor.findOne({ aadhar: doctorAadhar }).select('name');
        return doctor.name
    }))
    return names;
}