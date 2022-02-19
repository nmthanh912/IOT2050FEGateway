import { createSlice } from "@reduxjs/toolkit";
import { INT, REAL, TEXT } from '../../components/protocol/datatypes'

const protocolSlice = createSlice({
    name: 'protocol',
    initialState: [{
        sname: 'ModbusRTU',
        columns: [{
            colName: 'com_port_num',
            type: INT,
            required: true
        }, {
            colName: 'parity',
            type: INT,
            required: true
        }, {
            colName: 'slave',
            type: INT,
            required: true
        }, {
            colName: 'baudrate',
            type: REAL,
            required: true
        }, {
            colName: 'stopbits',
            type: TEXT
        }, {
            colName: 'databits',
            type: TEXT
        }]
    }, {
        sname: 'OPC_UA',
        columns: [{
            colName: 'url',
            type: TEXT
        }]
    }],
    reducers: {
        createTable: (state, action) => {
            state.push(action.payload)
            return state
        },
        dropTable: (state, action) => {
            let idx = state.findIndex(protocol => protocol.sname === action.payload)
            if(idx !== -1) state.splice(idx, 1)
            return state
        },
        alterTable: (state, action) => {
            let idx = state.findIndex(protocol => protocol.sname === action.payload.prev.sname)
            if(idx === -1) return state
            Object.assign(state[idx], action.payload.next)
        }
    }
})

export const { createTable, dropTable, alterTable } = protocolSlice.actions
export default protocolSlice.reducer