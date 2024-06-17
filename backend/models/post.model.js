import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postText: {
        type: String,

    },
    postImage: {
        type: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            commentText: {
                type: String,
                required: true
            },
            commentor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            } 
        }
    ]
}, {timestamps: true})

const Post = mongoose.model('Post', postSchema);

export default Post;