import {NodeCG} from '../../../../types/server'

import {GhostClient, GhostServer} from "./ghostserver";

export default (nodecg: NodeCG) => {
    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });

    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");

    runner1.value = { steam: "sovietpropaganda", displayName: "water" };
    runner2.value = { steam: "phunkpai_", displayName: "PhunkPai" };

    const server = new GhostServer();

    server.on('clients', (clients: Map<number, GhostClient>) => {
        let clientsList = [...clients.values()].map(c => {
            let ret = Object.assign({}, c);
            ret.socket = undefined;
            return ret;
        });
        ghostClients.value = clientsList;
    });
    server.on('time', (time) => {
        if (times.value[time.steamName] == undefined) {
            let newTimes = times.value;

            newTimes[time.steamName] = [time];
            console.log("Assigning to", newTimes);
            times.value = newTimes;
        } else {
            let newTimes = times.value;
            newTimes[time.steamName] = [...newTimes[time.steamName], time].sort((a, b) => a.totalSeconds - b.totalSeconds);
            console.log("Assigning to", newTimes);
            times.value = newTimes;
        }
    });

    server.start();
}
