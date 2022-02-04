const { PassThrough, Transform } = require("stream")
const MultiStream = require("multistream")
const fs = require("fs")
const p = require("path")
const path = require("path")
function factory(files, dirname) {
  let count = 0
  return (cb) => {
    if (count === files.length) return cb(null, null)

    const appendTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk)
      },
      flush(cb) {
        if (count !== files.length) this.push(files[count].split(dirname)[1] + "𐞙")
        cb()
      },
    })
    cb(null, fs.createReadStream(files[count++]).pipe(appendTransform))
  }
}

function getFiles(dir) {
  return fs.readdirSync(dir).flatMap((item) => {
    const path = `${dir}${p.sep}${item}`
    if (fs.statSync(path).isDirectory()) {
      return getFiles(path)
    }
    return path
  })
}

module.exports = function send(dirname) {
  dirname = path.resolve(dirname)
  const files = getFiles(dirname)
  const stream = new PassThrough()
  stream.write(files[0].split(dirname)[1] + "𐞙")
  const filesStream = new MultiStream(factory(files, dirname))
  filesStream.pipe(stream)
  return stream
}
