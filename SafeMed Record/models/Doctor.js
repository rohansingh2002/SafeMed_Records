const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
        index: true
    },
    abhaId: {
        type: String,
        default: "",
    },
    aadhar: {
        type: String,
        required: [true, 'Please provide a valid aadhar'],
        unique: true,
        minlength: 12,
        maxlength: 12,
        index: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: [true, 'Please provide a valid gender']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    specialization: {
        type: String,
        required: [true, 'Please provide a valid specialization']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    }
})

doctorSchema.pre('save', async function (next) {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

doctorSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;