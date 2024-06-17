import Post from "../models/post.model.js"
import User from "../models/user.model.js"

import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req, res) => {

    console.log("inside create  post")
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

        if (postText.length > 750){
            return res.status(400).json({
                success: false,
                message: "Maximum 750 characters are allowed in a post",
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