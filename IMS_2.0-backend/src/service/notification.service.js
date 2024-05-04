const { ObjectId } = require("mongodb");
const countPages = require("../utils/helpers/count-pages");
const Notification = require("../models/notification.model");
const limit = Number(process.env.LIMIT) ?? 20


const notificationServices = {
    addNotification: async (notification) => {
        try {
            return await Notification.create(notification);
        } catch (error) {
            throw error
        }
    },
    insertNotification: async (notification) => {
        try {
            return await Notification.insertMany(notification);
        } catch (error) {
            throw error;
        }
    },
    getNotificationById: async (notificationId) => {
        try {
            return await Notification.findOne({ _id: new ObjectId(notificationId) })
        } catch (error) {
            throw error;
        }
    },
    deleteSelectedNotifications: async (notificationIds) => {
        try {
            const objectIdArray = notificationIds.map((id) => new ObjectId(id));
            return await Notification.deleteMany({ _id: { $in: objectIdArray } })
        } catch (error) {
            throw error;
        }
    },
    deleteAllNotification: async (id) => {
        try {
            return await Notification.deleteMany({ notificationFor: id });
        } catch (error) {
            throw error
        }
    },
    deleteNotification: async (notificationId) => {
        try {
            return await Notification.deleteOne({ _id: new ObjectId(notificationId) })
        } catch (error) {
            throw error;
        }
    },
    getNotificationCount: async (id) => {
        try {
            return await Notification.countDocuments({ isSeen: false, notificationFor: id })
        } catch (error) {
            throw error;
        }
    },
    getNotification: async (id, searchString, page = 1) => {
        try {
            const filter = {
                notificationFor: id
            };
            if (searchString) {
                filter["$or"] = [
                    { 'title': { "$regex": searchString, '$options': "i" } },
                    { 'description': { "$regex": searchString, '$options': "i" } }
                ]
            };
            const totalRecords = await Notification.countDocuments(filter);
            const notification = await Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalPages: await countPages(totalRecords),
                notification
            }
        } catch (error) {
            throw error;
        }
    },
    markNotificationAsSeen: async (id) => {
        try {
            let filter = {
                notificationFor: id,
                isSeen: false
            }

            return await Notification.updateMany(filter, { $set: { isSeen: true } });
        } catch (error) {
            throw error;
        }
    },
}

module.exports = notificationServices