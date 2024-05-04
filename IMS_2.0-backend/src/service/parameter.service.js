const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Parameter = require("../models/parameter.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const parameterServices = {
    parametersExistForCategory: async (categoryId) => {
        try {
            return await Parameter.findOne({ categoryId: new ObjectId(categoryId), isDeleted: false })
        } catch (error) {
            throw error;
        }
    },
    createParameter: async (dataToInsert) => {
        try {
            return await Parameter.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getParameterList: async (page = 1, searchString) => {
        try {
            let filter = {
                "isDeleted": false
            };
            if (searchString) {
                filter["$or"] = [
                    { 'name': { "$regex": searchString, '$options': "i" } },
                    { 'parameter': { "$regex": searchString, '$options': "i" } }
                ]
            };
            const totalRecords = await Parameter.countDocuments(filter);
            const parameter = await Parameter.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                parameter
            }
        } catch (error) {
            throw error;
        }
    },
    getParameterById: async (parameterId) => {
        try {
            return await Parameter.findOne({ _id: new ObjectId(parameterId), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    updateParameterDetails: async (parameterId, dataToUpdate) => {
        try {
            return await Parameter.updateOne({ _id: new ObjectId(parameterId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedParameter: async (parameterIds) => {
        try {
            const objectIdArray = parameterIds.map((id) => new ObjectId(id));
            return await Parameter.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyParameter: async (dataToInsert) => {
        try {
            return await Parameter.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getParameterByCategoryId: async (categoryId) => {
        try {
            return await Parameter.find({ categoryId: new ObjectId(categoryId), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    updateParameterCategory: async (categoryId, dataToUpdate) => {
        try {
            return await Parameter.updateMany({ categoryId: new ObjectId(categoryId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    getCategoryParameterByName: async (category) => {
        try {
            return await Parameter.findOne({ name: category.toLowerCase(), isDeleted: false })
        } catch (error) {
            throw error;
        }
    },
    getParameters: async (category) => {
        try {
            return await Parameter.find({ isDeleted: false }).sort({ name: 1 })
        } catch (error) {
            throw error;
        }
    },
};

module.exports = parameterServices;