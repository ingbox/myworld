import { Elysia } from "elysia";

new Elysia()
  .ws("/ws", {
    open(ws) {
      console.log("OPEN");
      ws.send("hello");
    },
  })
  .listen(3005);

console.log("Listening on 3005");