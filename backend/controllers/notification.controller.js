import Notification from "../models/notification.model.js"

export const getNotifications = async (req,res) => {
    try {
        const userId = req.user._id
        const notifications = await Notification.find({to: userId}).sort({createdAt: -1}).populate({
            path: "from",
            select: ["fullName", "profileImage"]
        })

        await Notification.updateMany({to: userId}, {read: true})
        res.status(200).json({
            success: true,
            message: "Notifications fetched",
            data: notifications
        })
    } catch (error) {
        console.log(`Error in get all notifications controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}

export const deleteNotification = async (req,res) => {
    try {

        const userId = req.user._id
        await Notification.deleteMany({to: userId})
        res.status(200).json({
            success: true,
            message: "Notifications deleted",
            data: null
        })
        
    } catch (error) {
        console.log(`Error in delete all notifications controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}