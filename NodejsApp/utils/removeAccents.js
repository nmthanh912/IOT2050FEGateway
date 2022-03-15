const removeAccents = str => str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll('Đ', 'D').replace('đ', 'd')
    .replaceAll(' ', '').toLowerCase()
module.exports = removeAccents