const mongoose = require('mongoose');
const garbageSchemaSchema = require('./garbage.info');

const garbageSchema = new mongoose.Schema({
    actionTakenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //adding reference User model 
        required: true
    },
    garbageData: [{
        type: garbageSchemaSchema,
        required: false,
        default: []
    }]
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false
});

const Garbage = mongoose.model('Garbage', garbageSchema);
module.exports = Garbage;