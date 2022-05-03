import { Writable } from "stream"
import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import eos from "end-of-stream"

export default function receive(dirname) {
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
    if (stream) stream.end()
  })

  return rec
}
