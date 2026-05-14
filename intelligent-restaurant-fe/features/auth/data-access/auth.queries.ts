import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';

export const authQueries = {
  useLogin: () => {
    return useMutation({
      mutationFn: async ({ email, password }: { email: string; password: string }) =>
        await authApi.login(email, password),
    });
  },
};
