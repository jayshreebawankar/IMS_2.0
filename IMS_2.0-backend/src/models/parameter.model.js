const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
    parameter: {
        type: Array,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', //adding reference Category model 
        required: true
    },
    name: {
        type: String,
        required: true
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

const Parameter = mongoose.model('Parameter', parameterSchema);
module.exports = Parameter;