const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Rack = require("../models/rack.model");
const Block = require("../models/block.model");
const Stock = require("../models/stock.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const rackServices = {
    getRackByRackNo: async (rackNo) => {
        try {
            return await Rack.findOne({ rackNo: rackNo, isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    createRack: async (dataToInsert) => {
        try {
            return await Rack.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getRackList: async (page = 1, searchString) => {
        try {
            let filter = {
                "isDeleted": false
            };
            if (searchString) {
                filter["$or"] = [
                    { 'rackNo': { "$regex": searchString, '$options': "i" } },
                    { 'partitionArray': { "$regex": searchString, '$options': "i" } }
                ]
            };
            const totalRecords = await Rack.countDocuments(filter);
            const rack = await Rack.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                rack
            }
        } catch (error) {
            throw error;
        }
    },
    getRackById: async (rackId) => {
        try {
            return await Rack.findOne({ _id: new ObjectId(rackId), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    updateRackDetails: async (brandId, dataToUpdate) => {
        try {
            return await Rack.updateOne({ _id: new ObjectId(brandId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedRack: async (rackIds) => {
        try {
            const objectIdArray = rackIds.map((id) => new ObjectId(id));
            return await Rack.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyRack: async (dataToInsert) => {
        try {
            return await Rack.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getActiveRack: async () => {
        try {
            return await Rack.find({ isActive: true, isDeleted: false }, { rackNo: 1 }).sort({ rackNo: 1 });
        } catch (error) {
            throw error;
        }
    },
    getRackWiseBlock: async (rackId) => {
        try {
            return await Rack.find({ "rackId": new ObjectId(rackId) });
        } catch (error) {
            throw error;
        }
    },
    isRackExistByRackNo: async (rackNo) => {
        try {
            return await Rack.findOne({ rackNo: rackNo });
        } catch (error) {
            throw error;
        }
    },
    updateRackByRackNo: async (rackNo, dataToUpdate) => {
        try {
            return await Rack.updateOne({ rackNo: rackNo }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    getRackPartition: async (rackId) => {
        try {
            return await Rack.findOne({ _id: new ObjectId(rackId) }, { partitionArray: 1 })
        } catch (error) {
            throw error
        }
    },
    updateRackPartitionStatus: async (rackId, partitionName, status) => {
        try {
            return await Rack.updateOne(
                { _id: new ObjectId(rackId), "partitionArray.partitionName": partitionName },
                { "$set": { "partitionArray.$.isRackFilled": status } }
            )
        } catch (error) {
            throw error;
        }
    },
    updatePartitionStatus: async (dataToUpdate = []) => {
        try {
            return await Rack.bulkWrite(dataToUpdate);
        } catch (error) {
            throw error;
        }
    },
    checkRackIsInUsed: async (rackId) => {
        try {
            const filter = { rackId: new ObjectId(rackId), isActive: true, isDeleted: false }
            const blockResult = await Block.find(filter, { _id: 1 })
            const stockResult = await Stock.find(filter, { _id: 1 })
            return {
                blockResult,
                stockResult
            }
        } catch (error) {
            throw error;
        }
    }
};

module.exports = rackServices;