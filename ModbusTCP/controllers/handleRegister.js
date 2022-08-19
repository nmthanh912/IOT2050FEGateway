function RegEncode(tagList) {
    const tags = [...tagList]
    tags.sort((a, b) => (a.address > b.address ? 1 : -1))

    let size = tags[0].size
    let count = tags[0].address + size
    let tagListEncoded = [tags.shift()]

    const listRegEncoded = []

    tags.forEach((tag) => {
        if (count === tag.address) {
            tagListEncoded.push(tag)
            count = tag.address + tag.size
            size += tag.size
        } else {
            listRegEncoded.push({
                init: { address: (count - size), size, },
                tagList: tagListEncoded,
            })
            tagListEncoded = [tag]

            size = tag.size
            count = tag.address + size
        }
    })

    listRegEncoded.push({
        init: { address: (count - size), size, },
        tagList: tagListEncoded,
    })

    return listRegEncoded
}

module.exports = { RegEncode }
