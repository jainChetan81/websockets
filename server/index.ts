import http from "node:http";
import url from "node:url";
import { type WebSocket, WebSocketServer, RawData } from "ws";
import { v4 as uuidv4 } from "uuid";
const PORT = 8000;
const server = http.createServer();

const wsServer = new WebSocketServer({ server });

const connections = new Map<string, WebSocket>();
const users = new Map<string, Record<string, any>>();

function broadcastUsers() {
	for (const [user_id, connection] of connections) {
		const usersToSend = Array.from(users).filter(([id]) => id !== user_id);
		const data = usersToSend.map(([_, user]) => ({ username: user.username, state: user.state }));
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

wsServer.on("connection", (connection, req) => {
	//ws://localhost:8000
	const { username } = url.parse(req?.url ?? "", true)?.query;
	const uuid = uuidv4();
	connections.set(uuid, connection);
	users.set(uuid, { username: username as string, state: { x: 0, y: 0 } });
	console.log("connected", username, uuid);

	connection.on("message", (msg) => handleMessage(msg, uuid));
	connection.on("close", () => handleClose(uuid));
});

server.listen(PORT, () => {
	console.log("ws server is running on PORT:", PORT);
});
