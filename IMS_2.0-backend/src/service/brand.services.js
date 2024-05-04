const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Brand = require("../models/brand.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page



const brandServices = {
    getBrandByName: async (name) => {
        try {
            return await Brand.findOne({ name: name.toLowerCase(), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    createBrand: async (dataToInsert) => {
        try {
            return await Brand.create(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getBrandList: async (page = 1, searchString) => {
        try {
            let filter = {
                isDeleted: false
            };
            if (searchString) {
                filter.name = { "$regex": searchString, '$options': "i" };
            };
            const totalRecords = await Brand.countDocuments(filter);
            const brand = await Brand.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                brand
            }
        } catch (error) {
            throw error;
        }
    },
    getBrandById: async (brandId) => {
        try {
            return await Brand.findOne({ _id: new ObjectId(brandId), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    updateBrandDetails: async (brandId, dataToUpdate) => {
        try {
            return await Brand.updateOne({ _id: new ObjectId(brandId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedBrand: async (brandIds) => {
        try {
            const objectIdArray = brandIds.map((id) => new ObjectId(id));
            return await Brand.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyBrand: async (dataToInsert) => {
        try {
            return await Brand.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getActiveBrand: async () => {
        try {
            return await Brand.find({ isDeleted: false }, { name: 1 }).sort({ name: 1 });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = brandServices;