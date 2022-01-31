const { Writable } = require("stream")
const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

module.exports = function receive(dirname) {
  let stream
  return new Writable({
    write(chunk, en, cb) {
      if (chunk.toString().includes("𐞙")) {
        const file = chunk.toString().replace("𐞙", "")
        const p = path.dirname(file)
        mkdirp.sync(path.join(dirname, p))
        if (stream) stream.end()
        stream = fs.createWriteStream(path.join(dirname, file))
      } else {
        stream.write(chunk)
      }
      cb()
    },
    final(callback) {
      stream.end(callback)
    },
  })
}
