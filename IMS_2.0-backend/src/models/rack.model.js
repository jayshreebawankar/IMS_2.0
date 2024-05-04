const mongoose = require('mongoose');

const rackSchema = new mongoose.Schema({
    rackNo: {
        type: String,
        required: true,
        // unique: true,
        // index: true,
    },
    partition: {
        type: String,
        required: true
    },
    partitionArray: {
        type: Array,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isRackEmpty: {
        type: Boolean,
        required: false,
        default: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    statics: false
}
);

const Rack = mongoose.model('Rack', rackSchema);
module.exports = Rack;