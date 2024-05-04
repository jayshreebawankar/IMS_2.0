const mongoose = require('mongoose');

const garbageSchemaSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', //adding reference Category model 
        required: true
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // Adding reference to the Stock model
        required: true
    },
}, {
    _id: false // Disable generation of ObjectId for this schema
})

module.exports = garbageSchemaSchema