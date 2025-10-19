import { useQuery } from '@tanstack/react-query';
import request from '../utils/api';
import type { IUser } from '../interface/IUser';

export const useUser = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("users/get");
      return response.data.user as IUser;
    },
  });

  return {
    user,
    isLoading,
    error
  };
};