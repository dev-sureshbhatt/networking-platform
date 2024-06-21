import Notification from '../models/notification.model.js'
import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'

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


export const getSuggestedUser = async (req,res) => {

    try {
        
    } catch (error) {
        console.log(`Error in getting suggested users: ${error}`)
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }

    const userId = req.user._id
    const usersFollowedByMe = await User.findById(userId).select("following")

    const users = await User.aggregate([
        {
            $match: {
                _id: { $ne: userId}
            }
        },
        {
            $sample: {
                size: 10
            }
        }
])

    // console.log("filtered users are", users)
    const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
    const suggestedUsers = filteredUsers.slice(0,4)
    suggestedUsers.forEach(user => user.password=null)
    
    res.status(200).json({success: true, message: "List of suggested users sent", data: suggestedUsers})

}

export const updateProfile = async (req,res) => {
    
    const {fullName, currentPassword, newPassword, bio, link} = req.body

    let {profileImage, coverImage} = req.body

    if (!fullName && !currentPassword && !newPassword & !bio && !link && !profileImage  && !coverImage){
        return res.status(400).json({
            success: false,
            message: "Nothing to update",
            data: null
        })
    }
    
    const userId = req.user._id
    

    try {
        const user = await User.findById(userId)
        
        if (!user){
            return res.status(404).json({
                success: false,
                message: "No user exists",
                data: null
            })
        } 

        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(400).json({
                success: false,
                message: "Please provide both current password and new password"
            })
        }

        if (currentPassword && newPassword){
            const isCorrect = await bcryptjs.compare(currentPassword, user.password)
            
            if (!isCorrect){
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                    data: null
                })
            } 
            
            if (newPassword.length < 6){
                return res.status(400).json({
                    success: false,
                    message: "New Password must be at least 6 characters long",
                    data: null // we can send provided data back with response to set the form data to previous default for better UX.
                })
            }

            const salt = await bcryptjs.genSalt(10)
            const newHashedPassword = await bcryptjs.hash(newPassword, salt)
            user.password = newHashedPassword 
        }

            if (profileImage){

                //Future optimization - also delete the previous images to save storage 
                const uploadImageResponse = await cloudinary.uploader.upload(profileImage)
                profileImage = uploadImageResponse.secure_url

            }

            if (coverImage){
                //Future optimization - also delete the previous images to save storage
                const uploadImageResponse = await cloudinary.uploader.upload(coverImage)
                coverImage = uploadImageResponse.secure_url
            }

            console.log("I am here")

            user.fullName = fullName || user.fullName;
            // user.email = email || user.email;
            // user.username = username || username; 
            user.bio = bio || user.bio;
            user.link = link || user.link;

            user.coverImage = coverImage || user.coverImage;
            user.profileImage = profileImage || user.profileImage; 
            
            const savedUser = await user.save()
            savedUser.password = null
            return res.status(200).json({
                success: true,
                message: "Profile updated",
                data: savedUser
            })






        
    } catch (error) {
        console.log(`Error in Update Profile Controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
        
    }
}