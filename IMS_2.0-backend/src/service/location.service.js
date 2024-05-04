const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Location = require("../models/location.model");
const Stock = require("../models/stock.model");
const Block = require("../models/block.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const locationServices = {
    createLocation: async (dataToInsert) => {
        try {
            return await Location.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getLocationByName: async (location) => {
        try {
            return await Location.findOne({ name: location.toLowerCase() });
        } catch (error) {
            throw error;
        }
    },
    getAllLocations: async () => {
        try {
            return await Location.find({}).sort({ name: 1 });
        } catch (error) {
            throw error;
        }
    },
    getLocationList: async (page = 1, searchString) => {
        try {
            let filter = {};
            if (searchString) {
                filter["$or"] = [
                    { 'name': { "$regex": searchString, '$options': "i" } },
                ]
            };
            const totalRecords = await Location.countDocuments(filter);
            const location = await Location.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                location
            }
        } catch (error) {
            throw error;
        }
    },
    getLocationById: async (locationId) => {
        try {
            return await Location.findOne({ _id: new ObjectId(locationId) });
        } catch (error) {
            throw error;
        }
    },
    getLocationByName: async (location) => {
        try {
            return await Location.findOne({ name: location, isActive: true })
        } catch (error) {
            throw error;
        }
    },
    getLocationName: async (name) => {
        try {
            return await Location.findOne({ name: name }).collation({ locale: "en", strength: 1 })
        } catch (error) {
            throw error;
        }
    },
    updateLocationDetails: async (locationId, dataToUpdate) => {
        try {
            return await Location.updateOne({ _id: new ObjectId(locationId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    checkLocationIsInUsed: async (locationId) => {
        try {
            const filter = {
                locationId: new ObjectId(locationId),
                isActive: true,
                isDeleted: false
            }
            const userResult = await Location.find(filter, { _id: 1 })
            const stockResult = await Stock.find({
                locationId: new ObjectId(locationId),
                'stockStatus': { '$ne': "sell" },
                isActive: true,
                isDeleted: false
            }, { _id: 1 })
            const blockResult = await Block.find(filter, { _id: 1 });
            return {
                userResult,
                stockResult,
                blockResult
            }
        } catch (error) {
            throw error;
        }
    }
};

module.exports = locationServices;