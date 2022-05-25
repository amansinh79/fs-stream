import { Writable } from "stream"
import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import eos from "end-of-stream"
import { deserialize } from "v8"
import types from "./types.js"

export default function receive(dirname) {
  dirname = path.resolve(dirname)
  let stream

  const rec = new Writable({
    write(chunk, en, cb) {
      chunk = deserialize(chunk)
      if (chunk.type === types.NAME) {
        const file = chunk.payload.toString()
        const p = path.dirname(file)
        mkdirp.sync(path.join(dirname, p))
        if (stream) stream.end()
        stream = fs.createWriteStream(path.join(dirname, file))
      } else {
        stream.write(chunk.payload)
      }
      cb()
    },
  })

  eos(rec, () => {
    if (stream) stream.end()
  })

  return rec
}
