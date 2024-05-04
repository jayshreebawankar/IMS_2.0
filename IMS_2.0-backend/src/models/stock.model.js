const { required } = require('joi');
const mongoose = require('mongoose');

// Define the schema
const stockInSchema = new mongoose.Schema({
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    block: {
        type: String,
        required: true
    },
    rackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rack',
        required: false,
    },
    rack: {
        type: String,
        required: false
    },
    partitionName: {
        type: String,
        required: false
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', //adding reference Category model 
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parameter',
        required: true
    },
    modelName: {
        type: String,
        required: true
    },
    conditionType: {
        type: String,
        enum: ["new", "refurbished"],
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "new"
    },
    itemCode: {
        type: String,
        unique: true,
        required: true
    },
    serialNo: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    parameter: {
        type: Object,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    },
    logs: {
        type: Array,
        required: false,
        default: []
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    materialAdded: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: false,
        default: []
    }],
    stockStatus: {
        type: String,
        required: true,
        default: "new"
    },
    amount: {
        type: String,
        required: false,
        default: null
    },
    remark: {
        type: String,
        required: false,
        default: null
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    soldDate: {
        type: Date,
        required: false,
        default: null
    }
},
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        strict: false
    }
);

// Create a model
const Stock = mongoose.model('Stock', stockInSchema);

module.exports = Stock;
