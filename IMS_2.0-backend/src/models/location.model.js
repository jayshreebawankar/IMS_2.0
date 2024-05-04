const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
            collation: { locale: 'en', strength: 2 }, // Use case-insensitive collation
        },
        isActive: {
            type: Boolean,
            default: true,
            required: false
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        strict: false
    }
);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
