module.exports = {
  uniqueId: function uniqueId() {
    if (uniqueId.id === undefined) {
      uniqueId.id = 0
    } else {
      uniqueId.id++
    }
    return uniqueId.id
  },
  isString: function isString(strLike) {
    return Object.prototype.toString.call(strLike).slice(8, -1) === 'String'
  },
}
