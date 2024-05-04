const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //adding reference User model 
        required: true
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // Adding reference to the Stock model
        required: true
    },
    logs: {
        type: Array,
        required: false,
        default: []
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false
}
);

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;