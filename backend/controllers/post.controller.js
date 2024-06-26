import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req, res) => {

    
    try {

        const {postText} = req.body
        let {postImage} = req.body

        console.log("post text is", postText, "and image is", postImage)

        const userId = req.user._id.toString()
        const user = await User.findById(userId)

        console.log("user requesting is", req.user, user)

        if (!user){
            return res.status(404).json({
                success: false,
                message: "No user exists, please submit an authentic request",
                data: null
            })
        }

        if (!postText && !postImage){
            return res.status(400).json({
                success: false,
                message: "Post must have some text or an image",
                data: null
            })
        }

        //need to validate post here for security measures

        if (postText.length > 2000){
            return res.status(400).json({
                success: false,
                message: "Maximum 2000 characters are allowed in a post",
                data: null
            })
        }

        
        if (postImage){
            const uploadImageResponse = await cloudinary.uploader.upload(postImage)
            postImage = uploadImageResponse.secure_url

        }

       const newPost = new Post({
        postedBy: userId,
        postText,
        postImage
       })

       await newPost.save()
       return res.status(201).json({
        success: true,
        message: "Post has been created and shared",
        data: newPost
       })





        

    } catch (error) {
        console.log(`Error in create new post controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
        
    }
}


export const deletePost = async (req,res) => {
    


    try {
    const postIdToDelete = req.params.id
    if (postIdToDelete.length !== 24) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid post id",
            data: null
        })
    } 
    const postToDelete = await Post.findById(postIdToDelete)
        if (!postToDelete){
            return res.status(404).json({
                success: false,
                message: "Post doesn't exist or has already been deleted",
                data: null
            })
        }
        if (postToDelete.postedBy.toString() === req.user._id.toString()){
            await Post.findByIdAndDelete(postIdToDelete)
            return res.status(200).json({
                success: true,
                message: "Post has been deleted successfully",
                data: null
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "You are not the post owner to delete this post",
                data: null
            })
        }        
    } catch (error) {
        console.log(`Error in delete post controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }

} 


export const commentOnPost = async (req,res) => {
    try {
        const {commentText} = req.body
        const postId = req.params.id
        const userId = req.user._id

        if (postId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid post id",
                data: null
            })
        } 

        if (!commentText){
            return res.status(400).json({
                success: false,
                message: "Comment text is required",
                data: null
            })
        }

        if (commentText.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Maximum 500 characters are allowed in a comment",
                data: null
            })
        }

        const targetPostToComment = await Post.findById(postId)
        if (!targetPostToComment){
            return res.status(400).json({
                success: false,
                message: "Please comment on a valid post",
                data: null
            })
        }

        const comment = {commentText, commentor: userId}
        targetPostToComment.comments.push(comment)

        await targetPostToComment.save()
        return res.status(200).json({
            success: true,
            message: "Comment has been posted",
            data: null
        })
    } catch (error) {
        console.log(`Error in post comment controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}

export const likeUnlikePost = async (req,res) => {
    try {
        const postId = req.params.id
        const userId = req.user._id

        if (postId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid post id",
                data: null
            })
        } 

        const postToLike = await Post.findById(postId)

        if (!postToLike){
            return res.status(404).json({
                success: false,
                message: "Post not found",
                data: null
            })
        }

        const isLikedAlready =  postToLike.likes.includes(userId) 
        if (isLikedAlready){
            //unlike the post if it is already liked by me
            await Post.findByIdAndUpdate(postId, {$pull: {likes: userId}})
            await User.findByIdAndUpdate(userId, {$pull: {likedPosts: postId} }) 

            const updatedLikesOnPost = postToLike.likes.filter( (id) => id.toString() !== userId.toString())

            return res.status(200).json({
                success: true,
                message: "Like removed from post",
                data: updatedLikesOnPost
            })
            //need to add another function to delete notification if the post is unliked
        } else {
            //else like the postl
            postToLike.likes.push(userId)
            await User.findByIdAndUpdate(userId, {$push: {likedPosts: postId} })
            await postToLike.save()

            const updatedLikes = postToLike.likes
            
            const notification = new Notification({
                from: userId,
                to: postToLike.postedBy,
                type: "like"

            })
            await notification.save()

            return res.status(200).json({
                success: true,
                message: "Post liked",
                data: updatedLikes
            })

        }
        


        
    } catch (error) {

        console.log(`Error in Like and Unlike posts controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
        
    }
}

export const getAllPosts =  async (req,res) => {
    try {
        const allPosts = await Post.find().sort({createdAt: -1}).populate({
            path: "postedBy",
            select: ["-password", "-email"]
        })
        .populate({
            path: "comments.commentor",
            select: ["-password", "-email"]
        })

        if (allPosts.length === 0){
            return res.status(200).json({
                success: true,
                message: "No posts available to show",
                data: null
            })
        }
        return res.status(200).json({
            success: true,
            message: "Fetched all latest posts",
            data: allPosts
        })
    } catch (error) {
        console.log(`Error in get all posts controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}

export const getLikedPosts = async (req, res) => {
    try {

        const userId = req.params.id //user id of which liked posts to fetch
        const user = await User.findById(userId)
        if (!user){
            return res.status(400).json({success: false, message: "No user found", data: null})
        }

        const likedPost = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: 'postedBy',
            select: '-password'
        })
        .populate({
            path: 'comments.commentor',
            select: '-password'
        })

        return res.status(200).json({
            success: true,
            message: "Fetched liked for for the target user",
            data: likedPost
        })
        
    } catch (error) {
        console.log(`Error in get liked posts controller: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    }
}

export const getFollowingPosts = async (req,res) => {
 try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user){
        return res.status(404).json({
            success: false,
            message: "No user exists",
            data: null
        })
    }

    const following = user.following
    const followingFeedPosts = await Post.find({postedBy: {$in: following}}).sort({createdAt: -1}).populate({
        path:"postedBy",
        select: ['-password', '-email']
    })
    .populate({
        path: "comments.commentor",
        select: ['-password', '-email']
    })

    return res.status(200).json({
        success: true,
        message: "Following feed data sent",
        data: followingFeedPosts
    })


 } catch (error) {
    console.log(`Error in fetching following posts for feed: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
    
 }
    
}


export const getUserPosts = async (req,res) => {
    try {

        const username = req.params.username
    const user = await User.findOne({username})
    if (!user){
        return res.status(404).json({
            success: false,
            message: "No user exists",
            data: null
        })
    } 

    const postsByUser = await Post.find({postedBy: user._id}).sort({createdAt: -1}).populate({
        path: "likes",
        select: ["-email", "-password"]
    })
    .populate({
        path: "comments.commentor",
        select: ["-email", "-password"]
    })
    .populate({
        path: "postedBy",
        select: ["-email", "-password"]
    })

    return res.status(200).json({
        success: true,
        message: "Posts by user sent",
        data: postsByUser
    })
        
    } catch (error) {

        console.log(`Error in fetching posts by user: ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        })
        
    }
    
}