import { createSlice } from "@reduxjs/toolkit";
import ShortUniqueId from "short-unique-id";
// import update from 'immutability-helper'

const uid = new ShortUniqueId({
    length: 7,
    dictionary: 'hex'
})

const tagSlice = createSlice({
    name: 'tag',
    initialState: [{
        id: uid(),
        name: 'Tag đo nhiệt độ',
        attribute: {
            temp: 273
        }
    }, {
        id: uid(),
        name: 'Tag đo nồng độ CO2',
        attribute: {}
    }],
    reducers: {
        addTag: (state, action) => {
            return [
                ...state,
                {
                    id: uid(),
                    name: action.payload.name,
                    attribute: action.payload.attribute
                }
            ]
        },
        updateTag: (state, action) => {
            let i = state.findIndex(val => val.id === action.payload.id)
            
            state[i].name = action.payload.name
            state[i].attribute = action.payload.attribute

            return state
        },
        deleteTag: (state, action) => {
            return state.filter(val => val.id !== action.payload)
        }
    }
})

export const { addTag, updateTag, deleteTag } = tagSlice.actions
export default tagSlice.reducer