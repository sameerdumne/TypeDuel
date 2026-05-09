import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { MatchmakingEngine } from "./matchmaking";

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.SOCKET_PORT ?? process.env.PORT ?? 4000);
const corsOrigin = process.env.SOCKET_CORS_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "*";

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true
  },
  transports: ["websocket", "polling"],
  pingInterval: 20_000,
  pingTimeout: 25_000,
  perMessageDeflate: false
});

const engine = new MatchmakingEngine(io);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "typedeul-socket",
    stats: engine.getStats()
  });
});

io.on("connection", (socket) => {
  engine.bind(socket);
  socket.emit("stats:update", engine.getStats());
});

engine.bootstrap().then(() => {
  httpServer.listen(port, () => {
    console.log(`TypeDuel socket server listening on :${port}`);
  });
});
