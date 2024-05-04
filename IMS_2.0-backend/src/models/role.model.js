const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
            unique: true,
            index: true,
            collation: { locale: 'en', strength: 2 }, // Use case-insensitive collation
        },
        tab: {
            type: Array,
            required: true,

        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        strict: false
    }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
