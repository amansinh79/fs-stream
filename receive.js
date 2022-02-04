const { Writable } = require("stream")
const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")
const eos = require("end-of-stream")

module.exports = function receive(dirname) {
  dirname = path.resolve(dirname)
  let stream

  const rec = new Writable({
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
  })

  eos(rec, () => {
    stream.end()
  })

  return rec
}
