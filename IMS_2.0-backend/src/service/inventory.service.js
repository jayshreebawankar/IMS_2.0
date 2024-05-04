const { ObjectId } = require("mongodb");
const Stock = require("../models/stock.model");
const countPages = require("../utils/helpers/count-pages");
const Category = require("../models/category.model");
const Brand = require("../models/brand.model");
const Location = require("../models/location.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page

const inventoryServices = {
    addStock: async (dataToInsert) => {
        try {
            return await Stock.create(dataToInsert);
        } catch (error) {
            throw error
        }
    },
    getStockList: async (page = 1, searchString, blockId, categoryId, conditionType, brandId) => {
        try {
            let filter = {
                "isDeleted": false,
                "stockStatus": "new"
            };

            if (blockId) {
                filter.blockId = new ObjectId(blockId)
            }

            if (categoryId) {
                filter.categoryId = new ObjectId(categoryId)
            }

            if (conditionType) {
                filter.conditionType = conditionType
            }

            if (brandId) {
                filter.brandId = new ObjectId(brandId)
            }

            if (searchString) {
                filter["$or"] = [
                    { 'conditionType': { "$regex": searchString, '$options': "i" } },
                    { 'status': { "$regex": searchString, '$options': "i" } },
                    { 'modelName': { "$regex": searchString, '$options': "i" } },
                    { 'itemCode': { "$regex": searchString, '$options': "i" } },
                    { 'serialNo': { "$regex": searchString, '$options': "i" } },
                ]
            };
            const totalRecords = await Stock.countDocuments(filter);
            const stock = await Stock.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                stock
            }
        } catch (error) {
            throw error
        }
    },
    getStockById: async (stockId) => {
        try {
            return await Stock.findOne({ _id: new ObjectId(stockId), isActive: true, isDeleted: false }).populate([{ "path": "categoryId", "select": ["name", "isReplaceable"] }]).lean();
        } catch (error) {
            throw error;
        }
    },
    updateStockDetail: async (stockId, dataToUpdate) => {
        try {
            return await Stock.updateOne({ _id: new ObjectId(stockId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyStocks: async (dataToInsert) => {
        try {
            return await Stock.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    updateStock: async (stockId, dataToUpdate) => {
        try {
            return await Stock.updateOne({ _id: new ObjectId(stockId) }, { "$set": dataToUpdate });
        } catch (error) {
            throw error
        }
    },
    getStockByLocationId: async (locationId) => {
        try {
            return await Stock.find({ locationId: new ObjectId(locationId) });
        } catch (error) {
            throw error;
        }
    },
    updateStockByLocationId: async (locationId, dataToUpdate) => {
        try {
            return await Stock.updateMany({ locationId: new ObjectId(locationId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    getMaterialList: async (categoryId, status, brandId, conditionType, parameter, parametersToMatch, page = 1) => {
        try {
            const filter = {
                categoryId,
                status,
                brandId,
                conditionType
            }

            if (parameter) {
                filter['$or'] = parameter.map(paramField => ({
                    [`parameter.${paramField}`]: { $in: parametersToMatch }
                }))
            }

            const totalRecords = await Stock.countDocuments(filter);
            const stock = await Stock.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                stock
            }
        } catch (error) {
            throw error;
        }
    },
    getCategoryWiseParameter: async (categoryId) => {
        try {
            return await Stock.find({ categoryId: new ObjectId(categoryId) }, { _id: 0, parameter: 1 })
        } catch (error) {
            throw error;
        }
    },
    getRackExistingPartition: async (rackId) => {
        try {
            return await Stock.find({ rackId: new ObjectId(rackId) }, { partitionName: 1, _id: 0 })
        } catch (error) {
            throw error;
        }
    },
    updateLogs: async (stockIds, updateLogs) => {
        try {
            const objectIdArray = stockIds.map((id) => new ObjectId(id));
            return await Stock.updateMany({ _id: { $in: objectIdArray } }, updateLogs)
        } catch (error) {
            throw error
        }
    },
    getStockWiseMaterial: async (stockId) => {
        try {
            return await Stock.findOne({ _id: new ObjectId(stockId) }, { parameter: 1, itemCode: 1 })
        } catch (error) {
            throw error;
        }
    },
    getItemCodeList: async (id) => {
        try {
            const filter = {
                assignedTo: new ObjectId(id)
            }
            return await Stock.find(filter, { _id: 0, itemCode: 1, categoryId: 1 }).populate({ "path": "categoryId", "select": ["name", "isReplaceable"] })
        } catch (error) {
            throw error;
        }
    },
    getDataToAddList: async (id, materialId, role) => {
        try {
            const filter = {
                // assignedTo: new ObjectId(id),
                _id: { $ne: new ObjectId(materialId) },
                stockStatus: "assigned"
            }

            if (role?.toLowerCase() !== "admin") {
                filter.assignedTo = new ObjectId(id),
                filter._id = { $ne: new ObjectId(materialId) },
                filter.stockStatus = "assigned"
            }
            return await Stock.find(filter, { itemCode: 1, categoryId: 1 }).populate({ "path": "categoryId", "select": ["name", "isReplaceable"] }).lean()
        } catch (error) {
            throw error;
        }
    },
    updateStockMaterial: async (stockId, dataToUpdate) => {
        try {
            return await Stock.updateOne({ _id: new ObjectId(stockId) }, dataToUpdate);
        } catch (error) {
            throw error;
        }
    },
    getRackExistingPartitionCount: async (rackId) => {
        try {
            return await Stock.countDocuments({ rackId: new ObjectId(rackId) })
        } catch (error) {
            throw error
        }
    },
    deleteSelectedStock: async (stockIds) => {
        try {
            const objectIdArray = stockIds.map((id) => new ObjectId(id));
            return await Stock.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } })
        } catch (error) {
            throw error;
        }
    },
    fetchedStockOutMaterial: async (page = 1, searchString) => {
        try {
            let filter = {
                stockStatus: "stock out"
            }
            if (searchString) {
                const searchRegex = new RegExp(searchString, 'i');
                const stockOutFilter = { name: searchRegex };

                const [categoryIds, brandIds, locationIds] = await Promise.all([
                    Category.find(stockOutFilter, { _id: 1 }),
                    Brand.find(stockOutFilter, { _id: 1 }),
                    Location.find(stockOutFilter, { _id: 1 })
                ]);

                const categoryIdArray = categoryIds.map(category => category._id);
                const brandIdArray = brandIds.map(brand => brand._id);
                const locationIdArray = locationIds.map(location => location._id);

                filter["$or"] = [
                    { categoryId: { $in: categoryIdArray } },
                    { brandId: { $in: brandIdArray } },
                    { locationId: { $in: locationIdArray } },
                    { amount: { $regex: searchRegex } },
                    { modelName: { $regex: searchRegex } },
                    { itemCode: { $regex: searchRegex } },
                    { serialNo: { $regex: searchRegex } },
                ];
            };

            const totalRecords = await Stock.countDocuments(filter);
            const stock = await Stock.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                stock
            }
        } catch (error) {
            throw error;
        }
    },
    getBlockWiseStock: async (blockId) => {
        try {
            const filter = {
                blockId: new ObjectId(blockId),
                'stockStatus': { '$ne': "sell" },
                isDeleted: false,
                isActive: true
            }
            return await Stock.find(filter, { _id: 1 })
        } catch (error) {
            throw error;
        }
    },
    getBrandWiseStock: async (brandId) => {
        try {
            const filter = {
                brandId: new ObjectId(brandId),
                'stockStatus': { '$ne': "sell" },
                isDeleted: false,
                isActive: true
            };
            return await Stock.find(filter, { _id: 1 })
        } catch (error) {
            throw error;
        }
    },
    getParameterWiseStock: async (parameterId) => {
        try {
            const filter = {
                parameterId: new ObjectId(parameterId),
                'stockStatus': { '$ne': "sell" },
                isDeleted: false,
                isActive: true
            };
            return await Stock.find(filter, { _id: 1 })
        } catch (error) {
            throw error;
        }
    },
    getItemCodeWiseStockData: async (itemCode) => {
        try {
            return await Stock.findOne({ itemCode: itemCode })
        } catch (error) {
            throw error;
        }
    }
}



module.exports = inventoryServices;