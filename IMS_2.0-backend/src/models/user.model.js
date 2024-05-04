
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                // Use a regular expression to validate the phone number format
                return /^[0-9]{10}$/g.test(value);
            },
            message: 'Invalid mobile number format',
        },
    },
    password: {
        type: String,
        required: true,
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', //adding reference Role model
    },
    role: {
        type: String,
        required: true,
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    location: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
