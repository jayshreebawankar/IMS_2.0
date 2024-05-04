const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blockNo: {
        type: String,
        required: true,
    },
    isRackAdded: {
        type: Boolean,
        required: false
    },
    rackId: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rack', // adding reference of vehicle model
        }],
        validate: {
            validator: function (arr) {
                return arr.every(elem => mongoose.Types.ObjectId.isValid(elem));
            },
            message: props => `${props.value} is not a valid ObjectId`
        },
    },
    rackNo: {
        type: Array,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false
}
);

const Block = mongoose.model('Block', blockSchema);
module.exports = Block;