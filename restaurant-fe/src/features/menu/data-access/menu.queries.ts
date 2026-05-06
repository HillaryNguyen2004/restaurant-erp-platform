import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuItemInput } from "../config/menu.config";
import { menuApi } from "./menu.api";

export const useMenuItems = () => {
    return useQuery({
        queryKey: ["menu-items"],
        queryFn: menuApi.getMenuItems,
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: menuApi.getCategories,
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-items"] });
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: MenuItemInput }) => menuApi.updateMenuItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-items"] });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menu-items"] });
        },
    });
};
