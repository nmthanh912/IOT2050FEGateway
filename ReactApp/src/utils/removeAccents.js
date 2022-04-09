const removeAccents = str => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replaceAll(' ', '_')
        .toLowerCase()
}
const removeAccentsWithUnderscore = str => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replaceAll(' ', '_')
        .toLowerCase()
}
export default removeAccents

export { removeAccentsWithUnderscore }