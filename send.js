import { PassThrough, Transform } from "stream"
import MultiStream from "multistream"
import fs from "fs"
import p from "path"
import path from "path"
import { readableNoopStream } from "noop-stream"

function factory(files, dirname, check, count) {
  return (cb) => {
    if (count === files.length) return cb(null, null)

    const appendTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk)
      },
      flush(cb) {
        ;(async () => {
          while (count !== files.length) {
            if (await check(files[count].split(dirname)[1])) {
              this.push(files[count].split(dirname)[1] + "𐞙")
              break
            } else {
              count++
            }
          }
          cb()
        })()
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

export default async function send(dirname, cb) {
  dirname = path.resolve(dirname)
  const files = getFiles(dirname)
  const stream = new PassThrough()
  let count = 0,
    file

  while (count !== files.length) {
    if (await cb(files[count].split(dirname)[1])) {
      file = files[count].split(dirname)[1] + "𐞙"
      break
    } else {
      count++
    }
  }

  if (file) stream.write(file)
  else return readableNoopStream()

  const filesStream = new MultiStream(factory(files, dirname, cb, count))
  filesStream.pipe(stream)
  return stream
}
