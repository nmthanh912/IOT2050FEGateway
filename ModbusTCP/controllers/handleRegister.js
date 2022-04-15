function RegEncode(tagList) {
    tagList.sort((a, b) => (a.address > b.address ? 1 : -1))

    var init = tagList[0].address
    var size = tagList[0].size
    var count = init + size

    const listRegEncoded = []
    var tagListEncoded = [tagList.shift()]

    tagList.forEach((tag) => {
        if (count === tag.address) {
            tagListEncoded.push(tag)
            count = tag.address + tag.size
            size += tag.size
        } else {
            listRegEncoded.push({
                init: {
                    address: init,
                    size,
                },
                tagList: tagListEncoded,
            })
            tagListEncoded = [tag]

            init = tag.address
            size = tag.size
            count = init + size
        }
    })

    listRegEncoded.push({
        init: {
            address: init,
            size,
        },
        tagList: tagListEncoded,
    })
    return listRegEncoded
}

module.exports = {RegEncode}
