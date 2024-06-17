import Post from "../models/post.model.js"
import User from "../models/user.model.js"

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