import * as Net from "net";
import {SmartBuffer} from "smart-buffer";
import {Color, DataGhost, Header, readColor, readDataGhost} from "./header";

const timeout = 5 * 1000;

function bufferRead(socket: Net.Socket, len: number): SmartBuffer | undefined {
    if (len == 0) {
        return new SmartBuffer();
    }

    let buf = undefined;
    let startTime = Date.now();

    while (buf == undefined && (Date.now() - startTime < timeout)) {
        buf = socket.read(len)
    }
    if (buf == undefined) {
        return undefined;
    }

    return new SmartBuffer().writeBuffer(buf);
}

function receiveSfmlPacket(socket: Net.Socket): SmartBuffer {
    let lengthBuf = bufferRead(socket, 4);
    if (lengthBuf !== undefined) {
        return bufferRead(socket, lengthBuf.readUInt32BE());
    } else {
        return undefined;
    }
}

function sendSfmlPacket(socket: Net.Socket, packet: SmartBuffer) {
    let message = new SmartBuffer();
    message.writeUInt32BE(packet.length);
    message.writeBuffer(packet.toBuffer());

    socket.write(message.toBuffer());
}

function readSfmlString(buffer: SmartBuffer): string {
    let chars = buffer.readUInt32BE();
    return buffer.readString(chars);
}

export class SpeedrunTime {
    steamName: string;
    map: string;
    totalSeconds: number;
    achieved: number;
}

export class GhostClient {
    id: number;

    localPort: number;
    name: string;
    ghost: DataGhost;
    model: string;
    level: string;
    tcpOnly: boolean;
    color: Color;
    spectator: boolean;

    socket: Net.Socket;
    raceReady: boolean;
}

export class GhostServer {
    server: Net.Server | undefined;

    unhandshakedSockets: Net.Socket[] = [];
    clients: Map<number, GhostClient> = new Map<number, GhostClient>();

    clientsUpdateCallback: (clients: Map<number, GhostClient>) => void;
    speedrunTimeCallback: (time: SpeedrunTime) => void;

    lastId: number = 100;

    on(event: string, callback: ((clients: Map<number, GhostClient>) => void) | ((time: SpeedrunTime) => void)) {
        switch (event) {
            case "clients":
                this.clientsUpdateCallback = callback as (clients: Map<number, GhostClient>) => void;
                break;
            case "time":
                this.speedrunTimeCallback = callback as (time: SpeedrunTime) => void;
                break;
            default:
                console.log("Tried to register for unknown event", event);
        }
    }

    start() {
        if (this.server) {
            return;
        }

        this.server = Net.createServer((socket) => {
            this.unhandshakedSockets.push(socket);

            socket.on('data', (chunk) => {
                this.handleChunk(socket, new SmartBuffer().writeBuffer(chunk))
            });
            socket.on('close', () => {
                this.unhandshakedSockets = this.unhandshakedSockets.filter((s) => s !== socket);
                Array.from(this.clients.values()).filter(c => c.socket !== socket).map(c => c.id)
                    .forEach(id => this.clients.delete(id));

                this.clientsUpdateCallback(this.clients);
            });
        });

        this.server.listen(53000, "0.0.0.0");
    }

    handleChunk(socket: Net.Socket, chunk: SmartBuffer) {
        if (this.unhandshakedSockets.includes(socket)) {
            // Receive handshake
            this.handleHandshakePacket(socket, chunk);
            return;
        }

        let length = chunk.readUInt32BE();
        let header = chunk.readUInt8();

        switch (header) {
            case Header.NONE: console.log("Received None packet"); break;
            case Header.CONNECT: console.log("Received Connect packet"); break;
            case Header.PING: console.log("Received Ping packet"); break;
            case Header.DISCONNECT: console.log("Received Disconnect packet"); break;
            case Header.STOP_SERVER: console.log("Received StopServer packet"); break;
            case Header.MAP_CHANGE: this.handleMapChangePacket(socket, chunk); break;
            case Header.HEART_BEAT: console.log("Received HeartBeat packet"); break;
            case Header.MESSAGE: this.handleMessagePacket(socket, chunk); break;
            case Header.COUNTDOWN: console.log("Received Countdown packet"); break;
            case Header.UPDATE: break;
            case Header.SPEEDRUN_FINISH: this.handleSpeedrunFinishPacket(socket, chunk); break;
            case Header.MODEL_CHANGE: console.log("Received ModelChange packet"); break;
            case Header.COLOR_CHANGE: console.log("Received ColorChange packet"); break;
            default: console.log(`Received unknown header: ${header}`); break;
        }
    }

    handleHandshakePacket(socket: Net.Socket, chunk: SmartBuffer) {
        let client = new GhostClient();

        let length = chunk.readUInt32BE();
        let header = chunk.readUInt8();
        client.localPort = chunk.readUInt16BE();
        client.name = readSfmlString(chunk);
        client.ghost = readDataGhost(chunk);
        client.model = readSfmlString(chunk);
        client.level = readSfmlString(chunk);
        client.tcpOnly = chunk.readUInt8() == 1;
        client.color = readColor(chunk);
        client.spectator = chunk.readUInt8() == 1;

        console.log(`New ghost joined: ${client.name}`);

        // Send handshake response
        let packet = new SmartBuffer();
        packet.writeUInt32BE(++this.lastId);
        packet.writeUInt32BE(0); // TODO: Show other players on the server?

        sendSfmlPacket(socket, packet);

        client.id = this.lastId;
        client.socket = socket;
        client.raceReady = false;

        this.clients[this.lastId] = client;
    }

    handleMapChangePacket(socket: Net.Socket, message: SmartBuffer) {
        let userId = message.readUInt32BE();
        let map = readSfmlString(message);

        let splitTicks = message.readUInt32BE();
        let splitTicksTotal = message.readUInt32BE();

        console.log(`Map change: User=${userId}, map=${map}, splitTicks=${splitTicks}, splitTicksTotal=${splitTicksTotal}`);
    }

    handleMessagePacket(socket: Net.Socket, message: SmartBuffer) {
        let userId = message.readUInt32BE();
        let content = readSfmlString(message);

        console.log(`New message: User=${userId}, Content="${content}"`);
    }

    handleSpeedrunFinishPacket(socket: Net.Socket, message: SmartBuffer) {
        let userId = message.readUInt32BE();
        let timeStr = readSfmlString(message);

        console.log(`Speedrun finished: User=${userId}, Time=${timeStr}`);

        let time = new SpeedrunTime();

        time.steamName = this.clients[userId]?.name;
        time.map = this.clients[userId]?.map;
        time.achieved = Date.now();

        if (timeStr.indexOf(":") != -1) {
            let parts = timeStr.split(".");

            let minutes = Number(parts[parts.length - 2]);
            let seconds = Number(parts[parts.length - 1]);

            time.totalSeconds = (minutes * 60) + seconds;
        } else {
            time.totalSeconds = Number(timeStr);
        }

        this.speedrunTimeCallback(time);
    }
}
