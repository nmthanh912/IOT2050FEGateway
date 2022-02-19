import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import ShortUniqueId from 'short-unique-id'
import tagService from '../../services/tag.service'

const uid = new ShortUniqueId({
    length: 7,
    dictionary: 'hex',
})

// const init = (async () => {
//     try {
//         const response = await tagService.getTagList()
//         return response.data
//     } catch (err) {
//         return []
//     }
// })()

const tagSlice = createSlice({
    name: 'tag',
    initialState: {
        tags: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        addTag: (state, action) => {
            return [
                ...state,
                {
                    id: uid(),
                    name: action.payload.name,
                    attribute: action.payload.attribute,
                },
            ]
        },
        updateTag: (state, action) => {
            let i = state.findIndex((val) => val.id === action.payload.id)

            state[i].name = action.payload.name
            state[i].attribute = action.payload.attribute

            return state
        },
        deleteTag: (state, action) => {
            return state.filter((val) => val.id !== action.payload)
        },
    },
    extraReducers(builder) {
        builder.addCase(fetchTags.fulfilled, (state, action) => {
            state.status = 'succeed'
            action.payload.forEach(val => state.tags.push(val))
            return state
        })
    },
})

export const {addTag, updateTag, deleteTag} = tagSlice.actions
export const fetchTags = createAsyncThunk('tag/fetchTags', async () => {
    try {
        const response = await tagService.getTagList()
        return response.data
    } catch (err) {
        return []
    }
})

export default tagSlice.reducer
