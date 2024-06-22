import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: followUnfollow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/follow/${userId}`,
          {
            method: "PUT",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "something went wrong");
        }

        return data.data;
      } catch (error) {
        throw new Error(error.message || "something went wrong");
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
  });
  return {followUnfollow, isPending}
};

export default useFollow;
