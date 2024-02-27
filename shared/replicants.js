"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replicantStores = exports.replicants = exports.ReplicantStores = exports.Replicants = exports.Replicant = void 0;
// Dummy replicant for typing
const replicantstore_1 = require("./replicantstore");
const constants_1 = require("./constants");
class Replicant {
    on(_event, _callback) { }
}
exports.Replicant = Replicant;
class Replicants {
    constructor(nodecg) {
        this.runner1 = nodecg.Replicant("runner1", { defaultValue: {}, persistent: false });
        this.runner2 = nodecg.Replicant("runner2", { defaultValue: {}, persistent: false });
        this.commentators = nodecg.Replicant("commentators", { defaultValue: [], persistent: false });
        this.player1Vetos = nodecg.Replicant("player1Vetos", { defaultValue: Array(constants_1.VETOS_PER_PLAYER), persistent: false });
        this.player2Vetos = nodecg.Replicant("player2Vetos", { defaultValue: Array(constants_1.VETOS_PER_PLAYER), persistent: false });
        this.usedMaps = nodecg.Replicant("usedMaps", { defaultValue: [], persistent: false });
        this.currentMap = nodecg.Replicant("currentMap", { defaultValue: undefined, persistent: false });
        this.ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
        this.times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
        this.attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false });
        this.streamDelay = nodecg.Replicant("streamDelay", { defaultValue: 5, persistent: false });
        this.score1 = nodecg.Replicant("runner-score1", "p2cml");
        this.score2 = nodecg.Replicant("runner-score2", "p2cml");
        this.timerDuration = nodecg.Replicant("timer-duration", "p2cml");
        this.runData = nodecg.Replicant("runDataActiveRun", "nodecg-speedcontrol");
        this.timer = nodecg.Replicant("timer", "nodecg-speedcontrol");
    }
}
exports.Replicants = Replicants;
class ReplicantStores {
    constructor(replicants) {
        this.runner1 = new replicantstore_1.ReplicantStore(replicants.runner1);
        this.runner2 = new replicantstore_1.ReplicantStore(replicants.runner2);
        this.commentators = new replicantstore_1.ReplicantStore(replicants.commentators);
        this.player1Vetos = new replicantstore_1.ReplicantStore(replicants.player1Vetos);
        this.player2Vetos = new replicantstore_1.ReplicantStore(replicants.player2Vetos);
        this.usedMaps = new replicantstore_1.ReplicantStore(replicants.usedMaps);
        this.currentMap = new replicantstore_1.ReplicantStore(replicants.currentMap);
        this.ghostClients = new replicantstore_1.ReplicantStore(replicants.ghostClients);
        this.times = new replicantstore_1.ReplicantStore(replicants.times);
        this.attempts = new replicantstore_1.ReplicantStore(replicants.attempts);
        this.streamDelay = new replicantstore_1.ReplicantStore(replicants.streamDelay);
        this.score1 = new replicantstore_1.ReplicantStore(replicants.score1);
        this.score2 = new replicantstore_1.ReplicantStore(replicants.score2);
        this.timerDuration = new replicantstore_1.ReplicantStore(replicants.timerDuration);
        this.runData = new replicantstore_1.ReplicantStore(replicants.runData);
        this.timer = new replicantstore_1.ReplicantStore(replicants.timer);
    }
}
exports.ReplicantStores = ReplicantStores;
let replicantsSingleton;
let replicantStoresSingleton;
function replicants(nodecg) {
    if (!replicantsSingleton) {
        replicantsSingleton = new Replicants(nodecg);
    }
    return replicantsSingleton;
}
exports.replicants = replicants;
function replicantStores(nodecg) {
    if (!replicantStoresSingleton) {
        replicantStoresSingleton = new ReplicantStores(replicants(nodecg));
    }
    return replicantStoresSingleton;
}
exports.replicantStores = replicantStores;
