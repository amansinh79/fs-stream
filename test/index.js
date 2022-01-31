const { send, receive } = require("..")
const dircompare = require("dir-compare")
const test = require("tape")
const { pipeline } = require("stream/promises")

test("copy", async (t) => {
  await pipeline(send("files"), receive("copied"))
  const res = dircompare.compareSync("files", "copied")
  t.true(res.same)
})
