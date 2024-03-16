const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
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
    hospitalId: {
        type: String,
        required: [true, 'Please provide a valid unique id'],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    diagnostics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diagnostic'
    }]
})

hospitalSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

hospitalSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;