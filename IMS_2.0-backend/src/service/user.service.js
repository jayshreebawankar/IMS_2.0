const { ObjectId } = require("mongodb");
const User = require("../models/user.model");
const countPages = require("../utils/helpers/count-pages");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page

const userServices = {
    createUser: async (dataToInsert) => {
        try {
            return await User.create(dataToInsert);
        } catch (error) {
            throw error
        }
    },
    getUserByMobile: async (mobile) => {
        try {
            return await User.findOne({ mobile: String(mobile), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    getUserByUserId: async (userId) => {
        try {
            return await User.findOne({ userId, isDeleted: false }).populate('roleId');
        } catch (error) {
            throw error
        }
    },
    getLatestCreatedRecord: async () => {
        try {
            return await User.find({}).sort({ createdAt: -1 }).limit(1);
        } catch (error) {
            throw error
        }
    },
    getUserList: async (page = 1, searchString) => {
        try {
            let filter = {
                "role": {
                    "$ne": "admin"
                },
                "isDeleted": false
            };
            if (searchString) {
                filter["$or"] = [
                    { 'name': { "$regex": searchString, '$options': "i" } },
                    { 'email': { "$regex": searchString, '$options': "i" } },
                    { 'mobile': { "$regex": searchString, '$options': "i" } },
                    { 'userId': { "$regex": searchString, '$options': "i" } },
                    { 'location': { "$regex": searchString, '$options': "i" } },
                ]
            };
            const totalRecords = await User.countDocuments(filter);
            const user = await User.find(filter).sort({ createdAt: -1 }).limit(20).populate("roleId", "role").skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                user
            }
        } catch (error) {
            throw error
        }
    },
    getUserByRoleId: async (roleId) => {
        try {
            return await User.find({ roleId: new ObjectId(roleId), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    updateUserRole: async (roleId, dataToUpdate) => {
        try {
            return await User.updateMany({ roleId: new ObjectId(roleId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    getUserByObjId: async (userId) => {
        try {
            return await User.findOne({ _id: new ObjectId(userId), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    updateUserDetails: async (userId, dataToUpdate) => {
        try {
            return await User.updateOne({ _id: new ObjectId(userId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedUsers: async (userIds) => {
        try {
            const objectIdArray = userIds.map((id) => new ObjectId(id));
            return await User.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
        } catch (error) {
            throw error;
        }
    },
    addBulkilyUser: async (dataToInsert) => {
        try {
            return await User.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getUserByLocationId: async (locationId) => {
        try {
            return await User.find({ locationId: new ObjectId(locationId) });
        } catch (error) {
            throw error;
        }
    },
    updateUserByLocationId: async (locationId, dataToUpdate) => {
        try {
            return await User.updateMany({ locationId: new ObjectId(locationId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    getActiveUser: async () => {
        try {
            const filter = {
                'isActive': true,
                'role': { '$ne': "admin" },
            }
            return await User.find(filter, { name: 1 })
        } catch (error) {
            throw error;
        }
    },
    getAdminInfo: async () => {
        try {
            return await User.find({ "role": "admin" }, { _id: 1 })
        } catch (error) {
            throw error;
        }
    }
}



module.exports = userServices;