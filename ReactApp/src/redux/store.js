import { configureStore } from '@reduxjs/toolkit'
import protocolReducer from './slices/protocol'
import tagReducer from './slices/tag'
import mqttReducer from './slices/mqtt'

const store = configureStore({
    reducer: {
        protocol: protocolReducer,
        tag: tagReducer,
        mqtt: mqttReducer
    }
})
export default store