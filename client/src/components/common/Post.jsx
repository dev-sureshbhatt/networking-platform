import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from './LoadingSpinner'
import { formatPostDate } from "../../utils/date";

const Post = ({ post }) => {

	const {data:authUser} = useQuery({queryKey: ['authUser']})


	const postOwner = post.postedBy; // an object that stores postedBy: {}
	const isLiked = post.likes.includes(authUser.data._id);	
	const isMyPost =  authUser.data._id === postOwner._id // to enable elements having editing rights 
	const formattedDate = formatPostDate(post.createdAt)

	const [commentText, setCommentText] = useState("");
	const queryClient = useQueryClient()

	const {mutate: deletePost, isPending: isDeleting} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
					method: 'Delete',
					credentials: 'include'
				})

				const data = await res.json()

				if (!data.success){
					throw new error(data.message || "something went wrong")
				}
				return data
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully")
			//we also needd  to invalidate the query
			queryClient.invalidateQueries({queryKey: ['posts']})
			
		}
	})

	const {mutate: likePost, isPending: isLiking} = useMutation({
		mutationFn: async () => {
			try {

				const res = await fetch(`http://localhost:5000/api/posts/like/${post._id}`, {
					method: 'PUT',
					credentials: 'include'
				})

				const data = await res.json()

				if (!res.ok || !data.success){
					throw new Error(data.message || "Something went wrong")
				}

				return data.data
				
			} catch (error) {
				throw new Error(error.message || "Something went wrong")
			}
		},
		onSuccess: (updatedLikes) => {

			// toast.success("Post liked successfully")
			//to fetch the number of updated likes, we can invalidate post query but this is not the best way, need to update this in future
			// queryClient.invalidateQueries({queryKey: ['posts']})
			//instead of invalidating pposts query, we will update the cache for that liked post
			
			// console.log("inside  success block", updatedLikes)
			queryClient.setQueryData(["posts"], (oldData)=>{
				return oldData.map((p)=> {
					if (p._id === post._id){
						return {...p, likes:updatedLikes}
					}
					return p
				})
			})
			
			// queryClient.setQueryData(['posts'], (oldData)=> {
			// 	return oldData.map((p) => {
			// 		if (p._id === post._id){
			// 			return { ...p, likes: updatedLikes}
			// 		}
			// 		return p
			// 	})
			// }) 

		}
	})

	const {mutate: commentPost, isPending: isCommenting} = useMutation({
		mutationFn: async () => {

			try {

				const res = await fetch(`http://localhost:5000/api/posts/comment/${post._id}`, {
					method: 'PUT',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({commentText})
				})

				const data = await res.json()

				if (!data.success || !res.ok){
					throw new Error(data.message || "Something went wrong")
				}

				return data.data
				
			} catch (error) {
				throw new Error(error.message || "Something went wrong")
			}

		},
		onSuccess: () => {
			toast.success("Comment has been posted")
			setCommentText("")
			queryClient.invalidateQueries({queryKey: ['posts']})
		}
	})


	const handleDeletePost = () => {
		deletePost()
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;
		commentPost()
	};

	const handleLikePost = () => {
		if (isLiking) return;
		likePost()
	};

	return (
		<>
			<div className='flex gap-3 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImage || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1 gap-2'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold text-sm'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-500 flex gap-1 text-sm items-center'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span className="text-xs">{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && (<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />)}
								{
									isDeleting && (<LoadingSpinner size="xs"/>)
								}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span className="text-sm">{post.postText}</span>
						{post.postImage && (
							<img
								src={post.postImage}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.commentor.profileImage || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.commentor.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.commentor.username}
														</span>
													</div>
													<div className='text-sm'>{comment.commentText}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={commentText}
											onChange={(e) => setCommentText(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner  size={"sm"} /> }
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm text-slate-500 group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : ""
									}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;
