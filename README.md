# fs-stream

It is a file copier using only one stream!
all of the files are passsed through one stream separeted by "𐞙".

### Example

```
const { send, receive } = require("@solvencino/fs-stream")

send("files").pipe(receive("copied"))
```

### Limits

1. It cant copy files containing "𐞙".
2. It will not copy empty folders.
