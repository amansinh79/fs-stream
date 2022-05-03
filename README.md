# fs-stream

It is a file copier using only one stream!
all of the files are passsed through one stream separeted by "𐞙".

### Example

```
import { send, receive } from "@solvencino/fs-stream"
import { pipeline } from "stream/promises"

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
```

"send" can have second argument callback function which receives filepath as argument, you can return false to skip the file.

### Limits

1. It cant copy files containing "𐞙".
2. It will not copy empty folders.
