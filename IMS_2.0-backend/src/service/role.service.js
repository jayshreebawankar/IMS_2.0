const { ObjectId } = require("mongodb");
const Role = require("../models/role.model")
const countPages = require("../utils/helpers/count-pages");
const User = require("../models/user.model");
const limit = Number(process.env.LIMIT) ?? 20  //number of documents have to show per page

const roleServices = {
    createRole: async (dataToInsert) => {
        try {
            return await Role.create(dataToInsert);
        } catch (error) {
            throw error
        }
    },
    getRoleByName: async (role) => {
        try {
            return await Role.findOne({ role: role.toLowerCase(), isDeleted: false });
        } catch (error) {
            throw error
        }
    },
    getRoleList: async (page = 1, searchString = "") => {
        try {
            let filter = {
                "isDeleted": false,
                'role': { '$ne': "admin" },
                "$or": [
                    { "role": { "$regex": searchString, '$options': "i" } },
                    {
                        "tab": {
                            $elemMatch: {
                                $regex: searchString,
                                $options: "i" // Optional: Case-insensitive matching
                            }
                        }
                    }]
            };
            const totolRecords = await Role.countDocuments(filter)
            const roles = await Role.find(filter).sort({ createdAt: -1 }).limit(20).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totolRecords),
                roles
            }
        } catch (error) {
            throw error
        }
    },
    addBulkilyRole: async (dataToInsert) => {
        try {
            return await Role.insertMany(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getRoleById: async (roleId) => {
        try {
            return await Role.findOne({ _id: new ObjectId(roleId), isDeleted: false });
        } catch (error) {
            throw error;
        }
    },
    updateRoleDetails: async (roleId, dataToUpdate) => {
        try {
            return await Role.updateOne({ _id: new ObjectId(roleId) }, { $set: dataToUpdate });
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedRoles: async (roleIds) => {
        try {
            const objectIdArray = roleIds.map((id) => new ObjectId(id));
            //return await Role.updateMany({ _id: { $in: objectIdArray } }, { $set: { isDeleted: true } });
            return await Role.deleteMany({ _id: { $in: objectIdArray } })
        } catch (error) {
            throw error;
        }
    },
    getActiveRole: async () => {
        try {
            return await Role.find({ 'role': { '$ne': "admin" }, isDeleted: false }, { role: 1 }).sort({ role: 1 });
        } catch (error) {
            throw error;
        }
    },
    // getRoleByName: async (role) => {
    //     try {
    //         return await Role.findOne({ role: role, isDeleted: false }).collation({ locale: "en", strength: 1 });
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    deleteUsersRole: async (roleIds, session) => {
        try {
            const objectIdArray = roleIds.map((id) => new ObjectId(id));
            return await User.updateMany({ roleId: { $in: objectIdArray } }, { $set: { isDeleted: true } }, { session });
        } catch (error) {
            throw error;
        }
    }
}



module.exports = roleServices;