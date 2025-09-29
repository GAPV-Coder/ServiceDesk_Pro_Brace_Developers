import { useAppSelector, useAppDispatch } from '../store/hooks'
import {
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../store/slices/categoriesSlice'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../api/types/category.types'

export function useCategories() {
    const dispatch = useAppDispatch()
    const { categories, currentCategory, isLoading, error } = useAppSelector(
        (state) => state.categories
    )

    const loadCategories = (includeInactive: boolean = false) => {
        dispatch(fetchCategories(includeInactive))
    }

    const loadCategoryById = (id: string) => {
        dispatch(fetchCategoryById(id))
    }

    const createNewCategory = async (data: CreateCategoryRequest) => {
        const result = await dispatch(createCategory(data))
        return result
    }

    const updateExistingCategory = async (id: string, data: UpdateCategoryRequest) => {
        const result = await dispatch(updateCategory({ id, data }))
        return result
    }

    const deleteExistingCategory = async (id: string) => {
        const result = await dispatch(deleteCategory(id))
        return result
    }

    return {
        categories,
        currentCategory,
        isLoading,
        error,
        loadCategories,
        loadCategoryById,
        createCategory: createNewCategory,
        updateCategory: updateExistingCategory,
        deleteCategory: deleteExistingCategory,
    }
}