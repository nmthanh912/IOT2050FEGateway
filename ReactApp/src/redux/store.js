import { configureStore } from '@reduxjs/toolkit'
import protocolReducer from './slices/protocol'

const store = configureStore({
    reducer: {
        protocol: protocolReducer
    }
})
export default store