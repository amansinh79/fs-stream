import { PassThrough, Transform } from "stream"
import MultiStream from "multistream"
import fs from "fs"
import path from "path"
import { readableNoopStream } from "noop-stream"
import { serialize } from "v8"
import types from "./types.js"

let files, count, dirname, check

function factory() {
  return (cb) => {
    if (count === files.length) return cb(null, null)

    const appendTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, serialize({ type: types.DATA, payload: chunk }))
      },
      flush(cb) {
        ;(async () => {
          const file = await getNextFile()
          if (file) {
            this.push(file)
          }
          cb()
        })()
      },
    })

    cb(null, fs.createReadStream(files[count++]).pipe(appendTransform))
  }
}

async function getNextFile() {
  while (count !== files.length) {
    if (await check(files[count].split(dirname)[1])) {
      return serialize({ type: types.NAME, payload: files[count].split(dirname)[1] })
    } else {
      count++
    }
  }
  return false
}

function noopTrue() {
  return true
}

export default async function send(dir, fileList, cb) {
  dirname = path.resolve(dir)
  files = fileList || []
  const stream = new PassThrough()

  count = 0
  check = cb || noopTrue
  const file = await getNextFile()

  if (file) stream.write(file)
  else return readableNoopStream()

  const filesStream = new MultiStream(factory())
  filesStream.pipe(stream)
  return stream
}
