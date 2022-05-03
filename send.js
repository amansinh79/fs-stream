import { PassThrough, Transform } from "stream"
import MultiStream from "multistream"
import fs from "fs"
import p from "path"
import path from "path"
import { readableNoopStream } from "noop-stream"

let files, count, dirname, check

function factory() {
  return (cb) => {
    if (count === files.length) return cb(null, null)

    const appendTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk)
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

function getFiles(dir) {
  return fs.readdirSync(dir).flatMap((item) => {
    const path = `${dir}${p.sep}${item}`
    if (fs.statSync(path).isDirectory()) {
      return getFiles(path)
    }
    return path
  })
}

async function getNextFile() {
  while (count !== files.length) {
    if (await check(files[count].split(dirname)[1])) {
      return files[count].split(dirname)[1] + "𐞙"
    } else {
      count++
    }
  }
  return false
}

function noopTrue() {
  return true
}

export default async function send(dir, cb) {
  dirname = path.resolve(dir)
  files = getFiles(dirname)
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
