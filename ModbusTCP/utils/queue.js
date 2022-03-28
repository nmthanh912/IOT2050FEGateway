class Queue {
    constructor () {
        this.queue = [5]
    }

    enqueue (params) {
        this.queue.push(params)
    } 

    dequeue () {
        return this.queue.shift()
    }
}

module.exports = new Queue()