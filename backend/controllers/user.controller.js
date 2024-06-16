import Notification from '../models/notification.model.js'
import User from '../models/user.model.js'


//Get User details 
export const getUserProfile = async (req,res) => {
    const {username} = req.params
    console.log(username)
    try {
        const getUserDetails = await User.findOne({username}).select('-password')
        
        if (!getUserDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            })
        } 
        return res.status(200).json({
            success: true,
            message: "User found",
            data: getUserDetails
        })
        
    } catch (error) {
        console.log(`Error in fethching userdetails in usercontroller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }

}


//Follow unfollow a user
export const followUnfollowProfiles = async (req,res) => {
    try {
        const {id} = req.params

        //conditional check to avoid self following
        if (id.toString() === req.user._id.toString()){
            return res.status(400).json({
                success: false,
                message: "You can't follow yourself",
                data: null
            })
        }

        // fetching users' details 
        const userToModify = await User.findById(id) //User to follow/unfollow
        const currentUser = await User.findById(req.user._id) //req.user is getting assigned via authProtect authorization middleware
        
        //if no id exists
        if (!userToModify || !currentUser){
            return res.status(400).json({
                success: false,
                message: "User not found",
                data: null

            })
        }

        //checking the current status if following or not
        const isFollowing = currentUser.following.includes(id)

        if (isFollowing){
            //if following, unfollow the user
            await User.findByIdAndUpdate(req.user._id, { $pull: {following: id}})
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
            return res.status(200).json({
                success: true,
                message: "User unfollowed successfully",
                body: null

            })
        }  else{
            //else follow
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
            
            //in case of follow, we will create a notification object in Notification db model
            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: "follow"
            })

            await newNotification.save()



            return res.status(200).json({
                success: true,
                message: "User followed successfully",
                body: null

            })
        }
        



    } catch (error) {
        console.log(`Error in follow unfollow user: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}
