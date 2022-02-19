import { createSlice } from "@reduxjs/toolkit";

const mqttSlice = createSlice({
    name: 'mqtt',
    initialState: {
        clients: [{
            uname: 'phucvinh57',
            pwd: '123456',
            IP: '192.168.10.12',
            port: 3000
        }, {
            uname: 'userA',
            pwd: '123456',
            IP: '192.168.150.10',
            port: 8080
        }, {
            uname: 'userB',
            pwd: '654321',
            IP: '192.168.100.123',
            port: 5000
        }],
        topics: [{
            addr: 'http://145.256.120.12:3000',
            publisher: 'phucvinh57',
            subcribers: ['userA', 'userB']
        }],
    },
    reducers: {
        addClient: (state, action) => {
            console.log(action.payload)
            // Add new user
            state.clients.push({
                uname: action.payload.uname,
                pwd: action.payload.pwd,
                IP: action.payload.IP,
                port: action.payload.port
            })
            // Add new topics which are published by this user
            action.payload.published.forEach(addr => state.topics.push({
                addr: addr,
                publisher: action.payload.uname,
                subcribers: []
            }))
            // Add this user to address subcribers
            action.payload.subcribed.forEach(addr => {
                let subcribedTopic = state.topics.find(topic => topic.addr === addr.value)
                console.log(addr)
                console.log(subcribedTopic)
                subcribedTopic.subcribers.push(action.payload.uname)
            })
            return state
        },
        removeClient: (state, action) => {
            return state
        },
        modifyClient: (state, action) => {
            return state
        }
    }
})

export const { addClient, removeClient, modifyClient } = mqttSlice.actions;
export default mqttSlice.reducer