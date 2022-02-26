import { createSlice } from '@reduxjs/toolkit'

const gatewaySlice = createSlice({
    name: 'gateway',
    initialState: [{
        ID: '',
        name: '',
        mapping: [{
            deviceID: '',
            tagList: [{
                tagID: '',
                topic: ''
            }]
        }]
    }],
    reducers: {
        addGateway: (state, payload) => {

        },
        editGateway: (state, payload) => {

        },
        removeGateway: (state, payload) => {

        },
        addMapping: (state, payload) => {

        },
        removeMapping: (state, payload) => {

        },
        configMapping: (state, payload) => {

        }
    }
})

export const { 
    addGateway, 
    addMapping,
    removeGateway,
    removeMapping,
    configMapping,
    editGateway
} = gatewaySlice.actions

export default gatewaySlice.reducer