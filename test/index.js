const { send, receive } = require("..")
const dircompare = require("dir-compare")
const test = require("tape")
const { pipeline } = require("stream/promises")
const fs = require("fs")

test("copy", async (t) => {
  if (fs.existsSync("copied")) {
    fs.rmSync("copied", {
      recursive: true,
    })
  }
  await pipeline(send("files"), receive("copied"))
  const res = dircompare.compareSync("files", "copied")
  t.true(res.same)
})
