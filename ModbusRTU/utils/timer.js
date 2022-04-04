const timer = (tmax, t = 1) => {
    if (t === tmax || t > tmax) {
        return 1
    } else return t * 2
}

module.exports = timer
