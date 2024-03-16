const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const diagnosticSchema = new mongoose.Schema({
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
    diagnosticId: {
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
    }
})

diagnosticSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

diagnosticSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const Diagnostic = mongoose.model('Diagnostic', diagnosticSchema);

module.exports = Diagnostic;