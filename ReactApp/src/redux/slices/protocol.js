import { createSlice } from "@reduxjs/toolkit";

const protocolSlice = createSlice({
    name: 'protocol',
    initialState: {
        value: []
    },
    reducers: {
        createTable: (state, action) => {
            
        },
        dropTable: (state, action) => {

        },
        alterTable: (state, action) => {

        }
    }
})

export const { createTable, dropTable, alterTable } = protocolSlice.actions
export default protocolSlice.reducer