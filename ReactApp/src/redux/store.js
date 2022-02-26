import { configureStore } from '@reduxjs/toolkit'
import gatewayReducer from './slices/gateway'
import deviceReducer from './slices/device'

const store = configureStore({
    reducer: {
        gateway: gatewayReducer,
        device: deviceReducer
    }
})
export default store