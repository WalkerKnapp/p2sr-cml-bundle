import {SmartBuffer} from "smart-buffer";

export class Vector {
    x: number;
    y: number;
    z: number;

    static structSize = 4 + 4 + 4;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    read(buffer: SmartBuffer): Vector {
        buffer.readFloatBE(this.x);
        buffer.readFloatBE(this.y);
        buffer.readFloatBE(this.z);
        return this;
    }

    write(buffer: SmartBuffer) {
        buffer.writeFloatBE(this.x);
        buffer.writeFloatBE(this.y);
        buffer.writeFloatBE(this.z);
    }
}

export function readDataGhost(buffer: SmartBuffer): DataGhost {
    return new DataGhost(new Vector(0, 0, 0), new Vector(0, 0, 0), 0, false)
        .read(buffer);
}

export class DataGhost {
    position: Vector;
    viewAngle: Vector;
    viewOffset: number;
    grounded: boolean;

    static structSize = Vector.structSize + Vector.structSize + 1;

    constructor(position: Vector, viewAngle: Vector, viewOffset: number, grounded: boolean) {
        this.position = position;
        this.viewAngle = viewAngle;
        this.viewOffset = viewOffset;
        this.grounded = grounded;
    }

    read(buffer: SmartBuffer): DataGhost {
        this.position = new Vector(0, 0, 0).read(buffer);
        this.viewAngle = new Vector(0, 0, 0).read(buffer);

        let vG = buffer.readUInt8();

        this.viewOffset = vG & 0x7F;
        this.grounded = (vG & 0x80) != 0;
        return this;
    }

    write(buffer: SmartBuffer) {
        this.position.write(buffer);
        this.viewAngle.write(buffer);
        buffer.writeUInt8((this.viewOffset & 0x7F) | (this.grounded ? 0x80 : 0x00));
    }
}

export function readColor(buffer: SmartBuffer): Color {
    return new Color(0, 0, 0).read(buffer);
}

export class Color {
    r: number;
    g: number;
    b: number;

    static structSize = 1 + 1 + 1;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    read(buffer: SmartBuffer): Color {
        this.r = buffer.readUInt8();
        this.g = buffer.readUInt8();
        this.b = buffer.readUInt8();
        return this;
    }

    write(buffer: SmartBuffer) {
        buffer.writeUInt8(this.r);
        buffer.writeUInt8(this.g);
        buffer.writeUInt8(this.b);
    }
}

export enum Header {
    NONE,
    PING,
    CONNECT,
    DISCONNECT,
    STOP_SERVER,
    MAP_CHANGE,
    HEART_BEAT,
    MESSAGE,
    COUNTDOWN,
    UPDATE,
    SPEEDRUN_FINISH,
    MODEL_CHANGE,
    COLOR_CHANGE
}

function readStringLen(buffer: SmartBuffer): string {
    let chars = buffer.readUInt32BE();
    return buffer.readString(chars);
}

export class Client {
    id: number;
    name: string;
    data: DataGhost;
    modelName: string;
    currentMap: string;
    color: Color;
    spectator: boolean;

    read(buffer: SmartBuffer): Client {
        this.id = buffer.readUInt32BE();
        this.name = readStringLen(buffer);
        this.data = new DataGhost(undefined, undefined, 0, false).read(buffer);
        this.modelName = readStringLen(buffer);
        this.currentMap = readStringLen(buffer);
        this.color = new Color(0, 0, 0).read(buffer);
        this.spectator = buffer.readUInt8() == 1;
        return this;
    }
}
