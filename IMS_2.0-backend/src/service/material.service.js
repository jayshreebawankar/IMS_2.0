const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Material = require("../models/material.model");
const Stock = require("../models/stock.model");
const Category = require("../models/category.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page
const Location = require("../models/location.model");
const Brand = require("../models/brand.model");
const Rack = require("../models/rack.model");
const Block = require("../models/block.model")

const materialServices = {
    assignMaterial: async (dataToInsert) => {
        try {
            return await Material.insertMany(dataToInsert)
        } catch (error) {
            throw error;
        }
    },
    getAssignedMaterialList: async (page, searchString, id, role, userId) => {
        try {
            let filter = {
                stockStatus: "assigned"
            };
            if (role !== "admin") {
                filter.assignedTo = new ObjectId(id)
                // filter.stockStatus = "assigned";
            }

            if (searchString) {
                const searchRegex = new RegExp(searchString, 'i');
                const returnFilter = {
                    $or: [
                        { name: searchRegex },
                        { blockNo: searchRegex },
                        { rackNo: searchRegex }
                    ]
                };

                const [categoryIds, locationIds, brandIds, rackIds, blockIds] = await Promise.all([
                    Category.find(returnFilter, { _id: 1 }),
                    Location.find(returnFilter, { _id: 1 }),
                    Rack.find(returnFilter, { _id: 1 }),
                    Block.find(returnFilter, { _id: 1 }),
                    Brand.find(returnFilter, { _id: 1 }),
                ]);

                const categoryIdArray = categoryIds.map(category => category._id);
                const locationIdArray = locationIds.map(location => location._id);
                const brandIdArray = brandIds.map(brand => brand._id);
                const rackIdArray = rackIds.map(rack => rack._id);
                const blockIdArray = blockIds.map(block => block._id);

                filter["$or"] = [
                    { "categoryId": { $in: categoryIdArray } },
                    { "stockId": { $in: locationIdArray } },
                    { "brandId": { $in: brandIdArray } },
                    { "rackId": { $in: rackIdArray } },
                    { "blockId": { $in: blockIdArray } },
                    { "modelName": { $regex: searchRegex } },
                    { "conditionType": { $regex: searchRegex } },
                    { "status": { $regex: searchRegex } },
                    { "itemCode": { $regex: searchRegex } },
                    { "serialNo": { $regex: searchRegex } },
                ];
            }

            if (userId) {
                filter.assignedTo = new ObjectId(userId)
            }

            const totalRecords = await Stock.countDocuments(filter);
            const material = await Stock.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate([{ "path": "assignedTo", "select": "name" }])
            return {
                totalPages: await countPages(totalRecords),
                material
            }
        } catch (error) {
            throw error;
        }
    },
    getMaterialById: async (materialId) => {
        try {
            return await Material.findOne({ stockId: new ObjectId(materialId) })
        } catch (error) {
            throw error;
        }
    },
    returnMaterial: async (materialId, dataToUpdate) => {
        try {
            return await Stock.updateOne({ _id: new ObjectId(materialId) }, dataToUpdate);
        } catch (error) {
            throw error;
        }
    },
    findMaterialById: async (_id, materialId) => {
        try {
            return await Material.findOne({ userId: new ObjectId(_id), stockId: new ObjectId(materialId) })
        } catch (error) {
            throw error
        }
    },
    getReturnMaterialList: async (page = 1, searchString, id, role) => {
        try {
            let filter = {
                stockStatus: "return"
            };

            if (role !== "admin") {
                filter.assignedBy = new ObjectId(id)
            }


            if (searchString) {
                const searchRegex = new RegExp(searchString, 'i');
                const returnFilter = {
                    $or: [
                        { name: searchRegex },
                        { blockNo: searchRegex },
                        { rackNo: searchRegex }
                    ]
                };

                const [categoryIds, locationIds, brandIds, rackIds, blockIds] = await Promise.all([
                    Category.find(returnFilter, { _id: 1 }),
                    Location.find(returnFilter, { _id: 1 }),
                    Brand.find(returnFilter, { _id: 1 }),
                    Rack.find(returnFilter, { _id: 1 }),
                    Block.find(returnFilter, { _id: 1 }),
                ]);

                const categoryIdArray = categoryIds.map(category => category._id);
                const locationIdArray = locationIds.map(location => location._id);
                const brandIdArray = brandIds.map(brand => brand._id);
                const rackIdArray = rackIds.map(rack => rack._id);
                const blockIdArray = blockIds.map(block => block._id);

                filter["$or"] = [
                    { "categoryId": { $in: categoryIdArray } },
                    { "stockId": { $in: locationIdArray } },
                    { "brandId": { $in: brandIdArray } },
                    { "rackId": { $in: rackIdArray } },
                    { "blockId": { $in: blockIdArray } },
                    { "modelName": { $regex: searchRegex } },
                    { "conditionType": { $regex: searchRegex } },
                    { "status": { $regex: searchRegex } },
                    { "itemCode": { $regex: searchRegex } },
                    { "serialNo": { $regex: searchRegex } },
                ];
            }
            const totalRecords = await Stock.countDocuments(filter);
            const material = await Stock.find(filter, { locationId: 1, blockId: 1, rackId: 1, categoryId: 1, brandId: 1, modelName: 1, conditionType: 1, status: 1, itemCode: 1, serialNo: 1, quantity: 1 }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
                .populate([{ "path": "locationId", "select": "name" }, { "path": "blockId", "select": "blockNo" }, { "path": "rackId", "select": "rackNo" }, { "path": "categoryId", "select": "name" }, { "path": "brandId", "select": "name" }]);
            return {
                totalPages: await countPages(totalRecords),
                material
            }
        } catch (error) {
            throw error;
        }
    },
    getStatusWiseMaterial: async (status, page, searchString) => {
        try {
            let filter = {};
            //for stock list tab
            if (status?.toLowerCase() === "accept") {
                filter.stockStatus = "accept";
                filter.amount = null
            }

            //for inventory look tab
            if (status?.toLowerCase() === "sell") {
                filter.amount = { "$ne": null }
                filter.stockStatus = "accept"
            }

            //for stock out tab
            if (status?.toLowerCase() === "stock out") {
                filter.stockStatus = "sell"
            }

            if (searchString) {
                const searchRegex = new RegExp(searchString, 'i');
                const returnFilter = {
                    $or: [
                        { name: searchRegex },
                        { blockNo: searchRegex },
                        { rackNo: searchRegex }
                    ]
                };

                const [categoryIds, locationIds, brandIds, rackIds, blockIds] = await Promise.all([
                    Category.find(returnFilter, { _id: 1 }),
                    Location.find(returnFilter, { _id: 1 }),
                    Rack.find(returnFilter, { _id: 1 }),
                    Block.find(returnFilter, { _id: 1 }),
                    Brand.find(returnFilter, { _id: 1 }),
                ]);

                const categoryIdArray = categoryIds.map(category => category._id);
                const locationIdArray = locationIds.map(location => location._id);
                const brandIdArray = brandIds.map(brand => brand._id);
                const rackIdArray = rackIds.map(rack => rack._id);
                const blockIdArray = blockIds.map(block => block._id);

                filter["$or"] = [
                    { "categoryId": { $in: categoryIdArray } },
                    { "stockId": { $in: locationIdArray } },
                    { "brandId": { $in: brandIdArray } },
                    { "rackId": { $in: rackIdArray } },
                    { "blockId": { $in: blockIdArray } },
                    { "modelName": { $regex: searchRegex } },
                    { "conditionType": { $regex: searchRegex } },
                    { "status": { $regex: searchRegex } },
                    { "itemCode": { $regex: searchRegex } },
                    { "serialNo": { $regex: searchRegex } },
                ];
            };

            const totalRecords = await Stock.countDocuments(filter);
            const material = await Stock.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
            return {
                totalPages: await countPages(totalRecords),
                material
            }
        } catch (error) {
            throw error;
        }
    },
    monthlySoldOutMaterial: async (year) => {
        try {
            return await Stock.aggregate([
                {
                    '$match': {
                        'isActive': true,
                        'isDeleted': false,
                        'soldDate': {
                            '$ne': null
                        }
                    }
                }, {
                    '$addFields': {
                        'soldYear': {
                            '$year': '$soldDate'
                        }
                    }
                }, {
                    '$match': {
                        'soldYear': year
                    }
                }, {
                    '$group': {
                        '_id': {
                            'month': {
                                '$month': '$soldDate'
                            }
                        },
                        'count': {
                            '$sum': 1
                        }
                    }
                }, {
                    '$project': {
                        'month': '$_id.month',
                        '_id': 0,
                        'count': 1
                    }
                }, {
                    '$sort': {
                        'month': 1
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
};

module.exports = materialServices;