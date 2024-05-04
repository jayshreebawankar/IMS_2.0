const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
            required: true,
        },
        notificationFor: {
            type: String,
            required: true,
        },
        isSeen: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        strict: false
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;