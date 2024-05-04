const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
    },
    isReplaceable: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false
}
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;