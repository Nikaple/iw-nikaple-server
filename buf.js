var bf = require('bytebuffer')
var b = bf.wrap(
    new Buffer([7, 0, 0, 1, 2, 3, 4, 7, 0, 1, 2, 3, 4, 5, 7, 0, 2, 3, 4, 5, 6]),
    'utf-8',
    bf.LITTLE_ENDIAN
)
var len = 0
var arr = []
console.log(b)

len = b.readInt16()
while (b.offset != b.limit) {
    if (b.offset < len) {
        arr.push(b.readInt8())
    } else {
        console.log(arr)
        arr = []
        len += b.readInt16()
    }
}
console.log(arr)
