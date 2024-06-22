import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";

const host = 'http://localhost:5000'

//using feedType prop to render different feed (discover / following)
const Posts = ({feedType}) => {

	const getPostEndpoint = () => {
		switch(feedType){
			case "discover": // feed for discovering new feed
				return `${host}/api/posts/all`;
			case "following": //feed for posts of people you follow
				return `${host}/api/posts/following`;
			default: 
			return `${host}/api/posts/all`;

		}
	}


	const POST_ENDPOINT = getPostEndpoint();

	const {data: fetchedPosts, isLoading, refetch, isRefetching} =useQuery({
			queryKey: ['posts'],
			queryFn: async () => {
				try {
					const res = await fetch(POST_ENDPOINT, {
						credentials: "include"
					})
					const data = await res.json()
					if (!res.ok || !data.success){
						throw new Error(data.message || "Something went wrong")
					}

					return data.data
				} catch (error) {
				throw new Error(error)
				
				}
				
			}
		})

		
		useEffect(()=>{

			refetch()

		}, [feedType, refetch])

	// console.log("fetched postss in postss.jsx", fetchedPosts.data[0])

	

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && fetchedPosts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && fetchedPosts && (
				<div>
					{fetchedPosts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;