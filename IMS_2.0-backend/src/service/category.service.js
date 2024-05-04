const { ObjectId } = require("mongodb");
const Category = require("../models/category.model");
const countPages = require("../utils/helpers/count-pages");
const Parameter = require("../models/parameter.model");
const Stock = require("../models/stock.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const categoryServices = {
    getCategoryByName: async (name) => {
        try {
            return await Category.findOne({ name: name.toLowerCase(), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    createCategory: async (dataToInsert) => {
        try {
            return await Category.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getCategoryList: async (page = 1, searchString) => {
        try {
            let filter = {
                "isDeleted": false
            };
            if (searchString) {
                filter.name = { "$regex": searchString, '$options': "i" };
            };
            const totalRecords = await Category.countDocuments(filter);
            const category = await Category.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                category
            }
        } catch (error) {
            throw error;
        }
    },
    getCategoryById: async (categoryId) => {
        try {
            return await Category.findOne({ _id: new ObjectId(categoryId), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    updateCategoryDetails: async (categoryId, dataToUpdate) => {
        try {
            return await Category.updateOne({ _id: new ObjectId(categoryId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedCategory: async (categoryIds) => {
        try {
            const objectIdArray = categoryIds.map((id) => new ObjectId(id));
            return await Category.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyCategory: async (dataToInsert) => {
        try {
            return await Category.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getActiveCategory: async () => {
        try {
            return await Category.find({ isDeleted: false }, { name: 1 }).sort({ name: 1 });
        } catch (error) {
            throw error;
        }
    },
    deleteCategoryParameter: async (categoryIds, session) => {
        try {
            const objectIdArray = categoryIds.map((id) => new ObjectId(id));
            return await Parameter.updateMany({ categoryId: { $in: objectIdArray } }, { $set: { isDeleted: true } }, { session });
        } catch (error) {
            throw error;
        }
    },
    checkCategoryIsInUsed: async (categoryId) => {
        try {
            const parameterResult = await Parameter.find({ categoryId: new ObjectId(categoryId), isDeleted: false }, { _id: 1 })
            const stockResult = await Stock.find({ categoryId: new ObjectId(categoryId), 'stockStatus': { '$ne': "sell" }, isDeleted: false }, { _id: 1 })
            return {
                parameterResult,
                stockResult
            }
        } catch (error) {
            throw error;
        }
    }
};

module.exports = categoryServices;