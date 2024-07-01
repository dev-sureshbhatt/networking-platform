import toast from "react-hot-toast"
import {useMutation, useQueryClient } from "@tanstack/react-query"

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient()

    const {mutateAsync:updateProfile, isPending:isUpdatingProfile} = useMutation({
        mutationFn: async (formData) => {
            try {
                const res = await fetch('/api/users/update', {
                    method: 'PUT',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
    
                const data = await res.json()
                if (!data.success || !res.ok){
                    throw new Error(data.message || "something went wrong")
                }
                return data.data
            } catch (error) {
                console.log(error)
                toast.error("Something went wrong, please try again")
            }
        },
        onSuccess: () => {
            toast.success("Profile updated successfully")
            queryClient.invalidateQueries({queryKey: ['authUser']})
            queryClient.invalidateQueries({queryKey: ['userProfile']})
            
        }
    })
    
    return {updateProfile, isUpdatingProfile}

}


export default useUpdateUserProfile