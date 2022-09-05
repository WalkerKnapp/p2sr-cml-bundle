import {NodeCG} from '../../../../types/server'

import {GhostClient, GhostServer} from "./ghostserver";

export default (nodecg: NodeCG) => {
    const runDataActiveRun = nodecg.Replicant("runDataActiveRun", "nodecg-speedcontrol");

    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
    const attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false});
    const currentMap = nodecg.Replicant("currentMap", { persistent: false });

    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");
    const commentators = nodecg.Replicant("commentators");

    // TODO: This is just to mirror the current setup, it should probably move to some sort of dedicated dashboard
    runDataActiveRun.on('change', (newVal) => {
        if (newVal) {
            let allNames = [];
            for (let team of newVal.teams) {
                for (let player of team.players) {
                    allNames.push(player.name);
                }
            }

            runner1.value = { displayName: allNames[0], steam: runner1.value?.steam };
            runner2.value = { displayName: allNames[1], steam: runner2.value?.steam };
            commentators.value = allNames.slice(2);
        }
    });

    const server = new GhostServer();

    server.on('clients', (clients: Map<number, GhostClient>) => {
        // @ts-ignore
        ghostClients.value = [...clients.values()].map(c => {
            let ret = Object.assign({}, c);
            ret.socket = undefined;
            return ret;
        });
    });
    server.on('time', (time) => {
        // Only count times if they were achieved on the current map
        if (time.map !== currentMap.value?.mapFile) {
            return;
        }

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
