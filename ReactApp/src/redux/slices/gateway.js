import { createSlice } from '@reduxjs/toolkit'

const gatewaySlice = createSlice({
    name: 'gateway',
    initialState: [{
        ID: '12ab56f',
        name: 'Gateway A',
        mapping: [ '123456' ],
        protocol: 'MQTT Client',
        config: {}
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