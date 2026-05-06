import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';

export const authQueries = {
  useLogin: () => {
    return useMutation({
      mutationFn: ({ email, password }: { email: string; password: string }) =>
        authApi.login(email, password),
    });
  },
};
