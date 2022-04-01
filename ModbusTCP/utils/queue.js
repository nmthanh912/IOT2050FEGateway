class Queue {
    constructor (listEncoded) {
        this.queue = listEncoded
    }

    enqueue (params) {
        this.queue.push(params)
    } 

    dequeue () {
        return this.queue.shift()
    }
}

module.exports = Queue