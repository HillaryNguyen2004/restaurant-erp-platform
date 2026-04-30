import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tableApi } from './table.api';
import { TableStatus } from '../config/table.config';

export const tableQueries = {
  useTables: () => useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getTables(),
  }),

  useUpdateTableStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
        tableApi.updateTableStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      },
    });
  },
};
