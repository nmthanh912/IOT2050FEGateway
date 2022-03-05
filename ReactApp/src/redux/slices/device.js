import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DeviceService from "../../services/device";

// {
//     ID: '',
//     name: '',
//     tagList: [{
//         tagName: ''
//     }],
//     protocol: '',
//     description: '',
//     config: {}
// }

const deviceSlice = createSlice({
    name: 'device',
    initialState: [{
        ID: '123456',
        name: 'Thiết bị PLC',
        tagList: [{
            name: 'Nhiet do 1',
            unit: 'K',
            topicAddr: '/device1/nhietdo1'
        },
        {
            name: 'Ap suat',
            unit: 'Bar',
            topicAddr: '/device1/apsuat1'
        }, {
            name: 'Nhiet do 2',
            unit: 'K',
            topicAddr: '/device1/nhietdo2'
        }, {
            name: 'Ap suat 2',
            unit: 'Bar',
            topicAddr: '/device1/apsuat2'
        }],
        protocol: 'ModbusTCP',
        description: 'Mô tả thiết bị ở đây',
        config: {}
    }],
    reducers: {
        addDevice: (state, action) => {

        },
        removeDevice: (state, action) => {

        },
        updateDevice: (state, action) => {
            const device = state.find(val => parseInt(val.ID) === action.payload.id)
            Object.assign(device, action.payload)
            return state
        },
        addTag: (state, action) => {

        },
        removeTag: (state, action) => {

        },
        updateTag: (state, action) => {

        }
    },
    extraReducers(builder) {
        builder.addCase(fetchDevices.fulfilled, (state, action) => {
            action.payload.forEach(val => state.push({
                ...val,
                tagList: [],
                config: {}
            }))
            return state
        })
        builder.addCase(fetchTags.fulfilled, (state, action) => {
            const deviceID = action.payload.deviceID
            const device = state.find(val => val.ID === deviceID)
            device.tagList = []
            action.payload.data.forEach(val => device.tagList.push(val))
            return state
        })
    }
})

export const fetchDevices = createAsyncThunk('devices/fetchDevices', async () => {
    try {
        const response = await DeviceService.get()
        return response.data
    }
    catch (err) {
        return []
    }
})

export const fetchTags = createAsyncThunk('devices/fetchTags', async ({ deviceID, protocol }) => {
    try {
        const response = await DeviceService.getTags(deviceID, protocol)
        console.log(response.data)
        return {
            deviceID: deviceID,
            data: response.data
        }
    }
    catch (err) {
        console.log('?????')
        return []
    }
})

export const { addDevice, removeDevice, updateDevice, addTag, removeTag, updateTag } = deviceSlice.actions
export default deviceSlice.reducer