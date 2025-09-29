import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { categoriesService } from '../../api/types/services/categories.service'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../api/types/category.types'

interface CategoriesState {
    categories: Category[]
    currentCategory: Category | null
    isLoading: boolean
    error: string | null
}

const initialState: CategoriesState = {
    categories: [],
    currentCategory: null,
    isLoading: false,
    error: null,
}

export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (includeInactive: boolean = false, { rejectWithValue }) => {
        try {
            return await categoriesService.getAll(includeInactive)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
        }
    }
)

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await categoriesService.getById(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch category')
        }
    }
)

export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData: CreateCategoryRequest, { rejectWithValue }) => {
        try {
            return await categoriesService.create(categoryData)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category')
        }
    }
)

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, data }: { id: string; data: UpdateCategoryRequest }, { rejectWithValue }) => {
        try {
            return await categoriesService.update(id, data)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category')
        }
    }
)

export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await categoriesService.delete(id)
            return id
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category')
        }
    }
)

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCurrentCategory: (state) => {
            state.currentCategory = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCategories.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.isLoading = false
            state.categories = action.payload
        })
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        builder.addCase(fetchCategoryById.fulfilled, (state, action) => {
            state.currentCategory = action.payload
        })

        builder.addCase(createCategory.fulfilled, (state, action) => {
            state.categories.push(action.payload)
        })

        builder.addCase(updateCategory.fulfilled, (state, action) => {
            const index = state.categories.findIndex((c) => c.id === action.payload.id)
            if (index !== -1) {
                state.categories[index] = action.payload
            }
            if (state.currentCategory?.id === action.payload.id) {
                state.currentCategory = action.payload
            }
        })

        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.categories = state.categories.filter((c) => c.id !== action.payload)
        })
    },
})

export const { clearCurrentCategory } = categoriesSlice.actions
export default categoriesSlice.reducer
