const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Garbage = require("../models/garbage.model");
const Category = require("../models/category.model");
const Stock = require("../models/stock.model");
const limit = Number(process.env.LIMIT) ?? 20

const garbageServices = {
    insertGarbageData: async (dataToInsert) => {
        try {
            return await Garbage.create(dataToInsert)
        } catch (error) {
            throw error;
        }
    },
    getGarbageList: async (page = 1, searchString) => {
        try {
            const filter = {}

            if (searchString) {
                const searchRegex = new RegExp(searchString, 'i');
                const garbageFilter = {
                    $or: [
                        { name: searchRegex },
                        { modelName: searchRegex },
                        { itemCode: searchRegex }
                    ]
                };

                const [categoryIds, stockIds] = await Promise.all([
                    Category.find(garbageFilter, { _id: 1 }),
                    Stock.find(garbageFilter, { _id: 1 })
                ]);

                const categoryIdArray = categoryIds.map(category => category._id);
                const stockIdArray = stockIds.map(stock => stock._id);

                filter["$or"] = [
                    { "garbageData.categoryId": { $in: categoryIdArray } },
                    { "garbageData.stockId": { $in: stockIdArray } }
                ];
            }
            const totalRecords = await Garbage.countDocuments(filter);
            const garbage = await Garbage.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit).populate([{ "path": "garbageData.categoryId", "select": "name" }, { "path": "garbageData.stockId", "select": ["modelName", "itemCode"] }]);
            return {
                totalPages: await countPages(totalRecords),
                garbage
            }
        } catch (error) {
            throw error;
        }
    }
};

module.exports = garbageServices