const connections = new Map<string, WebSocket>();
const users = new Map<string, Record<string, any>>();

function broadcastUsers() {
  for (const [user_id, connection] of connections) {
    const usersToSend = Array.from(users).filter(([id]) => id !== user_id);
    const data = usersToSend.map(([_, user]) => ({
      username: user.username,
      state: user.state,
    }));
    connection.send(JSON.stringify(data));
  }
}
const handleMessage = (bytesMsg: RawData, uuid: string) => {
  const user = users.get(uuid);
  if (!user) return;
  const { x, y } = JSON.parse(bytesMsg.toString());
  user.state = { x, y };
  broadcastUsers();
};

const handleClose = (uuid: string) => {
  const user = users.get(uuid);
  if (!user) return;
  console.log("disconnected", user.username, uuid);
  users.delete(uuid);
  connections.delete(uuid);
};
const server = Bun.serve({
  port: 8000,
  development: true,
  websocket: {
    message(ws, message) {}, // a message is received
    open(ws) {
      console.log("connected", ws);
    }, // a socket is opened
    close(ws, code, message) {}, // a socket is closed
    drain(ws) {}, // the socket is ready to receive more data
  },
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/blog") return new Response("Blog!");
    return new Response("404!");
  },
});
console.log(`Listening on ${server.url}`);
