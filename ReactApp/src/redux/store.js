import { configureStore } from '@reduxjs/toolkit'
import protocolReducer from './slices/protocol'
import tagReducer from './slices/tag'

const store = configureStore({
    reducer: {
        protocol: protocolReducer,
        tag: tagReducer
    }
})
export default store