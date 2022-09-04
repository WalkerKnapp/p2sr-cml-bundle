import {NodeCG} from '../../../../types/server'
import * as Net from "net";

import { SmartBuffer, SmartBufferOptions } from "smart-buffer";

import {Client, Color, DataGhost, Header, Vector} from "./header";

function writeStringLen(buffer: SmartBuffer, str: string) {
    buffer.writeUInt32BE(str.length);
    buffer.writeString(str);
}

function readStringLen(buffer: SmartBuffer): string {
    let chars = buffer.readUInt32BE();
    return buffer.readString(chars);
}

function readToSB(socket, len): SmartBuffer {
    //console.log("Reading a length of", len);

    if (len == 0) {
        return new SmartBuffer();
    }

    let buf = undefined;
    let startTime = process.hrtime.bigint();
    while (buf == undefined && (process.hrtime.bigint() - startTime < 1000000000)) {
        buf = socket.read(len);
    }
    if (buf == undefined) {
        throw new Error("Socket timed out.");
    }
    //console.log("Successfully read", buf);
    return new SmartBuffer().writeBuffer(buf);
}

function readStringLenSocket(socket): string {
    let chars = readToSB(socket, 4).readUInt32BE();
    return readToSB(socket, chars).toBuffer().toString();
}

function sendPacket(socket, packet) {
    let message = new SmartBuffer();
    message.writeUInt32BE(packet.length);
    message.writeBuffer(packet.toBuffer());

    socket.write(message.toBuffer());
}

function sendChatMessage(socket, authorId, content) {
    let message = new SmartBuffer();
    message.writeUInt8(Header.MESSAGE);
    message.writeUInt32BE(authorId);
    writeStringLen(message, content);

    sendPacket(socket, message);
}

function sendCountdownSetup(socket, preCommands, postCommands, duration) {
    let message = new SmartBuffer();
    message.writeUInt8(Header.COUNTDOWN);
    message.writeUInt32BE(0); // Originate from id=0, the server
    message.writeUInt8(0); // Step 0 == Setup
    message.writeUInt32BE(duration);
    writeStringLen(message, preCommands);
    writeStringLen(message, postCommands);

    sendPacket(socket, message);
}

function sendCountdownExecute(socket) {
    let message = new SmartBuffer();
    message.writeUInt8(Header.COUNTDOWN);
    message.writeUInt32BE(0); // Originate from id=0, the server
    message.writeUInt8(1); // Step 1 == Exec

    sendPacket(socket, message);
}

export = (nodecg: NodeCG) => {
    const times = nodecg.Replicant("times", { defaultValue: {} });

    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");

    runner1.value = { steam: "sovietpropaganda", displayName: "water" };
    runner2.value = { steam: "phunkpai_", displayName: "PhunkPai" };

    let userIds = {};
    let lastId = 100;

    const server = Net.createServer( (socket) => setTimeout(() => {
        // Receive handshake packet

        let length = readToSB(socket, 4).readUInt32BE();
        let header = readToSB(socket, 1).readUInt8();
        let localPort = readToSB(socket, 2).readUInt16BE();
        let name = readStringLenSocket(socket);
        let ghost = new DataGhost(new Vector(0, 0, 0), new Vector(0, 0, 0), 0, false)
            .read(readToSB(socket, DataGhost.structSize));
        let model = readStringLenSocket(socket);
        let levelName = readStringLenSocket(socket);
        let tcpOnly = readToSB(socket, 1).readUInt8()  == 1;
        let color = new Color(0, 0, 0).read(readToSB(socket, Color.structSize));
        let spectator = readToSB(socket, 1).readUInt8() == 1;

        console.log(`New ghost joined: ${name}`);

        // Send handshake response
        let packet = new SmartBuffer();
        packet.writeUInt32BE(++lastId);
        packet.writeUInt32BE(0);

        sendPacket(socket, packet);

        userIds[lastId] = name;

        // Setup listener for messages
        socket.on('data', (chunk) => {
            let message = new SmartBuffer().writeBuffer(chunk);
            let length = message.readUInt32BE();

            let header = message.readUInt8();

            switch (header) {
                case Header.NONE: console.log("Received None packet"); break;
                case Header.CONNECT: console.log("Received Connect packet"); break;
                case Header.PING: console.log("Received Ping packet"); break;
                case Header.DISCONNECT: console.log("Received Disconnect packet"); break;
                case Header.STOP_SERVER: console.log("Received StopServer packet"); break;
                case Header.MAP_CHANGE: {
                    let userId = message.readUInt32BE();
                    let map = readStringLen(message);

                    let splitTicks = message.readUInt32BE();
                    let splitTicksTotal = message.readUInt32BE();

                    console.log(`Map change: User=${userId}, map=${map}, splitTicks=${splitTicks}, splitTicksTotal=${splitTicksTotal}`);
                } break;
                case Header.HEART_BEAT: console.log("Received HeartBeat packet"); break;
                case Header.MESSAGE: {
                    let userId = message.readUInt32BE();
                    let content = readStringLen(message);

                    console.log(`New message: User=${userId}, Content="${content}"`);
                } break;
                case Header.COUNTDOWN: console.log("Received Countdown packet"); break;
                case Header.UPDATE: break;
                case Header.SPEEDRUN_FINISH:
                    let userId = message.readUInt32BE();
                    let time = readStringLen(message);
                    console.log(`Speedrun finished: User=${userId}, time=${time}`);

                    let totalSeconds = undefined;

                    if (time.indexOf(":") != -1) {
                        let parts = time.split(":");

                        let minutes = Number(parts[parts.length - 2]);
                        let seconds = Number(parts[parts.length - 1]);

                        totalSeconds = (minutes * 60) + seconds;
                    } else {
                        totalSeconds = Number(time);
                    }

                    let userName = userIds[userId];
                    console.log("Assigning data for username", userName);

                    let timeObject = {
                        totalSeconds: totalSeconds,
                        achieved: Date.now()
                    };

                    if (times.value[userName] == undefined) {
                        let newTimes = times.value;

                        newTimes[userName] = [timeObject];
                        console.log("Assigning to", newTimes);
                        times.value = newTimes;
                    } else {
                        let newTimes = times.value;
                        newTimes[userName] = [...newTimes[userName], timeObject].sort((a, b) => a.totalSeconds - b.totalSeconds);
                        console.log("Assigning to", newTimes);
                        times.value = newTimes;
                    }
                    break;
                case Header.MODEL_CHANGE: console.log("Received model change packet"); break;
                case Header.COLOR_CHANGE: console.log("Received color change packet"); break;
                default: console.log(`Received unknown header: ${header}`);
            }
        });

        socket.on('close', () => {
            console.log(`Connection to ${name} closed.`);
        })
    }, 250));
    server.listen(53000, "0.0.0.0");

}
