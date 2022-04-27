import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import DeviceService from "../../services/configserver/device";

const deviceSlice = createSlice({
    name: 'device',
    initialState: [],
    reducers: {
        addDevice: (state, action) => {
            const device = action.payload
            state.push({ ...device, tagList: [] })
            return state
        },
        addManyDevice: (state, action) => {
            const deviceList = action.payload
            deviceList.forEach(device => state.push({ ...device, tagList: [] }))
            return state
        },
        updateDevice: (state, action) => {
            const updatedData = action.payload
            const id = updatedData.ID
            const idx = state.findIndex(val => val.ID === id)
            delete updatedData.ID
            state[idx] = { ...state[idx], ...updatedData }
            console.log(state[idx])
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
        },
        editTagCell: (state, action) => {
            const { deviceID, tagName, attr, newValue } = action.payload
            console.log(action.payload)
            const device = state.find(val => val.ID === deviceID)
            const tag = device.tagList.find(val => val.name === tagName)
            console.log(current(tag))
            tag[attr] = newValue
            return state
        },
        removeTag: (state, action) => {
            const { deviceID, tagName } = action.payload
            const device = state.find(val => val.ID === deviceID)
            

            if(device.tagList.length === 1) {
                const sampleData = {...device.tagList[0]}
                const keys = Object.keys(sampleData)
                keys.forEach(key => sampleData[key] = '')
                device.tagList.unshift(sampleData)
                device.tagList.pop()
            }
            else {
                const tagIdx = device.tagList.findIndex(val => val.name === tagName)
                device.tagList.splice(tagIdx, 1)
            }

            return state
        },
        addNewTag: (state, action) => {
            const { deviceID, tag } = action.payload
            const device = state.find(val => val.ID === deviceID)
            if(device.tagList[0].name === '') device.tagList.shift()
            device.tagList.push(tag)
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
            console.log(action.payload.data)
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
    addManyDevice,
    removeDevice,
    updateDevice,
    updateTagList,
    editTagCell,
    removeTag,
    addNewTag
} = deviceSlice.actions
export default deviceSlice.reducer