import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DeviceService from "../../services/device";

const deviceSlice = createSlice({
    name: 'device',
    initialState: [],
    reducers: {
        addDevice: (state, action) => {
            const device = action.payload
            device.tagList = []
            state.push(device)
            return state
        },
        updateDevice: (state, action) => {
            const updatedData = action.payload
            const id = updatedData.ID
            const idx = state.findIndex(val => val.ID === id)
            state[idx].name = updatedData.name
            state[idx].description = updatedData.description
            state[idx].tagList = updatedData.tagList
            return state
        },
        removeDevice: (state, action) => {
            const deviceID = action.payload
            const idx = state.findIndex(device => {
                return device.ID === deviceID
            })
            state.splice(idx, 1)
            return state
        },
        updateTagList: (state, action) => {
            const deviceID = action.payload.deviceID
            const device = state.find(val => val.ID === deviceID)
            device.tagList = []
            action.payload.data.forEach(val => device.tagList.push(val))
            return state
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchDevices.fulfilled, (state, action) => {
            state.length = 0
            action.payload.forEach(val => state.push({
                ...val,
                tagList: []
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
        return {
            deviceID: deviceID,
            data: response.data
        }
    }
    catch (err) {
        return []
    }
})

export const {
    addDevice,
    removeDevice,
    updateDevice,
    updateTagList,
} = deviceSlice.actions
export default deviceSlice.reducer