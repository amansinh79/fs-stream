import { send, receive } from "../index.js"
import dircompare from "dir-compare"
import test from "tape"
import { pipeline } from "stream/promises"
import fs from "fs"
import path from "path"

test("copy", async (t) => {
  if (fs.existsSync("copied")) {
    fs.rmSync("copied", {
      recursive: true,
    })
  }
  await pipeline(
    await send("files", async (file) => {
      const res = !fs.existsSync(path.join("copied", file))
      if (res) {
        console.log(file)
      }
      return res
    }),
    receive("copied")
  )
  const res = dircompare.compareSync("files", "copied")
  t.true(res.same, "both dirs contain same content")
})
