const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
        collation: { locale: 'en', strength: 2 }, // Use case-insensitive collation
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

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;