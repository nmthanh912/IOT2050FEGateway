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
    initialState: [],
    reducers: {
        addDevice: (state, payload) => {

        },
        removeDevice: (state, payload) => {

        },
        updateDevice: (state, payload) => {

        },
        addTag: (state, payload) => {

        },
        removeTag: (state, payload) => {

        },
        updateTag: (state, payload) => {

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