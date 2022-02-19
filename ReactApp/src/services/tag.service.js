import http from './http-common'

const tagService = {
    getTagList: () => {
        return http.get('/tags')
    },
    addTag: data => {
        return http.post('/tag', data)
    },
    modifyTag: (id, data) => {
        return http.put(`/tag/${id}`, data)
    },
    deleteTag: id => {
        return http.delete(`/tag/${id}`)
    }
}

export default tagService