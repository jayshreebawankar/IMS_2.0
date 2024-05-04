const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Block = require("../models/block.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const blockServices = {
    getBlockByBlockNo: async (blockNo) => {
        try {
            return await Block.findOne({ blockNo: blockNo?.toString(), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    createBlock: async (dataToInsert) => {
        try {
            return await Block.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getBlockList: async (page = 1, searchString) => {
        try {
            let filter = {
                "isDeleted": false
            };
            if (searchString) {
                filter["$or"] = [
                    { 'location': { "$regex": searchString, '$options': "i" } },
                    { 'blockNo': { "$regex": searchString, '$options': "i" } },
                    { 'rackNo': { "$regex": searchString, '$options': "i" } },
                    { 'location': { "$regex": searchString, '$options': "i" } },
                ]
            };
            const totalRecords = await Block.countDocuments(filter);
            const block = await Block.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                block
            }
        } catch (error) {
            throw error;
        }
    },
    getBlockById: async (blockId) => {
        try {
            return await Block.findOne({ _id: new ObjectId(blockId), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    updateBlockDetails: async (blockId, dataToUpdate) => {
        try {
            return await Block.updateOne({ _id: new ObjectId(blockId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedBlock: async (blockIds) => {
        try {
            const objectIdArray = blockIds.map((id) => new ObjectId(id));
            return await Block.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } })
        } catch (error) {
            throw error;
        }
    },
    addBulkilyBlock: async (dataToInsert) => {
        try {
            return await Block.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getActiveLocation: async () => {
        try {
            return await Block.find({ isActive: true, isDeleted: false }, { location: 1 }).sort({ location: -1 });
        } catch (error) {
            throw error;
        }
    },
    getLocationWiseBlock: async (locationId) => {
        try {
            return await Block.find({ locationId: new ObjectId(locationId), isDeleted: false }).populate("rackId").sort({ "blockNo": 1 });
        } catch (error) {
            throw error
        }
    },
    getActiveBlock: async () => {
        try {
            return await Block.find({ isDeleted: false, isActive: true }, { blockNo: 1 }).sort({ name: 1 });
        } catch (error) {
            throw error;
        }
    },
    getBlockByLocationId: async (locationId) => {
        try {
            return await Block.find({ locationId: new ObjectId(locationId) });
        } catch (error) {
            throw error;
        }
    },
    updateBlockByLocationId: async (locationId, dataToUpdate) => {
        try {
            return await Block.updateMany({ locationId: new ObjectId(locationId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error
        }
    },
};

module.exports = blockServices;