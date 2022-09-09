import {NodeCG} from '../../../../types/server'

import {GhostClient, GhostServer, MapChange} from "./ghostserver";

enum Phase {
    NOT_IN_ROUND,
    PRACTICE,
    ROUND
}

export default (nodecg: NodeCG) => {
    const runDataActiveRun = nodecg.Replicant("runDataActiveRun", "nodecg-speedcontrol");

    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
    const attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false});
    const currentMap = nodecg.Replicant("currentMap", { persistent: false });

    const runner1 = nodecg.Replicant("runner1", { defaultValue: {}, persistent: false });
    const runner2 = nodecg.Replicant("runner2", { defaultValue: {}, persistent: false });
    const commentators = nodecg.Replicant("commentators", { defaultValue: [], persistent: false });

    const timer = nodecg.Replicant("timer", "nodecg-speedcontrol");
    const timerDuration = nodecg.Replicant('timer-duration', "p2cml");

    let playerOnFinalRun = {};

    let phase = Phase.NOT_IN_ROUND;

    // TODO: This is just to mirror the current setup, it should probably move to some sort of dedicated dashboard
    runDataActiveRun.on('change', (newVal) => {
        if (newVal) {
            let allNames = [];
            // @ts-ignore
            for (let team of newVal.teams) {
                for (let player of team.players) {
                    allNames.push(player.name);
                }
            }

            // @ts-ignore
            runner1.value = { displayName: allNames[0], steam: runner1.value?.steam };
            // @ts-ignore
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
        if (phase != Phase.ROUND) {
            // Allow players to complete a time if this is their final run
            if (!playerOnFinalRun[time.steamName]) {
                return;
            } else {
                playerOnFinalRun[time.steamName] = false;
            }
        }

        // Only count times if they were achieved on the current map
        // @ts-ignore
        if (time.map !== currentMap.value?.mapFile) {
            return;
        }

        if (times.value[time.steamName] == undefined) {
            let newTimes = times.value;

            newTimes[time.steamName] = [time];
            console.log("Assigning to", newTimes);
            times.value = newTimes;

            // @ts-ignore
            [...server.clients.keys()].forEach(id => {
                let numericId = Number(id);
                // @ts-ignore
                server.sendChatMessage(numericId, 0, `${time.steamName} got a new PB: ${formatTime(time.totalSeconds)}`);
            });
        } else {
            let newTimes = times.value;
            newTimes[time.steamName] = [...newTimes[time.steamName], time].sort((a, b) => a.totalSeconds - b.totalSeconds);
            console.log("Assigning to", newTimes);
            times.value = newTimes;

            // @ts-ignore
            [...server.clients.keys()].forEach(id => {
                let numericId = Number(id);
                // @ts-ignore
                server.sendChatMessage(numericId, 0, `${time.steamName} got a new PB: ${formatTime(time.totalSeconds)}`);
            });
        }
    });
    server.on('mapchange', (change: MapChange) => {
        if (phase == Phase.PRACTICE) {
            // @ts-ignore
            server.sendChatMessage(change.client.id, 0, `The next map is: ${currentMap.value.name}`);
            server.sendChatMessage(change.client.id, 0, "Type \"!r\" in chat when ready to start.");
        }

        if (phase == Phase.ROUND) {
            attempts.value[change.steamName] = (attempts.value[change.steamName] ?? 0) + 1;
        }

        if (playerOnFinalRun[change.steamName]) {
            playerOnFinalRun[change.steamName] = false;
            server.sendChatMessage(change.client.id, 0, `Final run finished.`);
            server.sendChatMessage(change.client.id, 0, `Your PB for this round was: ${formatTime(times.value?.[change.steamName]?.[0]?.totalSeconds)}`);
        }
    });

    server.start();

    // Controls for starting practice/race
    nodecg.listenFor("startPractice", () => {
        if (!currentMap.value) {
            console.log("No map selected!");
            return;
        }

        // Reset any playerOnFinalRun values that might have persisted from the last race
        // @ts-ignore
        if (runner1.value?.steam) {
            // @ts-ignore
            playerOnFinalRun[runner1.value?.steam] = false;
        }
        // @ts-ignore
        if (runner1.value?.steam) {
            // @ts-ignore
            playerOnFinalRun[runner2.value?.steam] = false;
        }

        // @ts-ignore
        if (timer.value && timer.value.state != "stopped") {
            // @ts-ignore
            nodecg.extensions['nodecg-speedcontrol'].sendMessage('timerReset');
        }
        phase = Phase.PRACTICE;

        // @ts-ignore
        [...server.clients.keys()].forEach(id => {
            let numericId = Number(id);
            // @ts-ignore
            server.sendCountdownSetup(numericId, `changelevel ${currentMap.value.mapFile}`, "", 0);
            server.sendCountdownExecute(numericId);
        });
    });

    nodecg.listenFor("startRound", () => {
        if (!currentMap.value) {
            console.log("No map selected!");
            return;
        }

        setTimeout(() => {
            phase = Phase.ROUND;

            // @ts-ignore
            if (timer.value && timer.value.state != "stopped") {
                // @ts-ignore
                nodecg.extensions['nodecg-speedcontrol'].sendMessage('timerReset');
            }
            // @ts-ignore
            nodecg.extensions['nodecg-speedcontrol'].sendMessage('timerStart');
        }, 5000);

        // @ts-ignore
        [...server.clients.keys()].forEach(id => {
            let numericId = Number(id);
            // @ts-ignore
            server.sendCountdownSetup(numericId, "", `changelevel ${currentMap.value.mapFile}`, 5);
            server.sendChatMessage(numericId, 0, "Both players are ready. The race will now start!");
            server.sendCountdownExecute(numericId);
        });
    });

    // Respond to the timer
    timer.on('change', (newValue, oldValue) => {
        if (!timerDuration.value) {
            return;
        }

        // @ts-ignore
        let timerDurationMillis = timerDuration.value * 60 * 1000;

        let newRemaining = timerDurationMillis;
        if (newValue) {
            // @ts-ignore
            newRemaining = timerDurationMillis - newValue.milliseconds;
        }

        let oldRemaining = timerDurationMillis;
        if (oldValue) {
            // @ts-ignore
            oldRemaining = timerDurationMillis - oldValue.milliseconds;
        }

        handleTimerChange(newRemaining, oldRemaining);
    });
    timerDuration.on('change', (newValue, oldValue) => {
        let timerMillis = 0;
        if (timer.value) {
            // @ts-ignore
            timerMillis = timer.value.milliseconds;
        }

        if (!newValue) {
            return;
        }

        // @ts-ignore
        let newRemaining = (newValue * 60 * 1000) - timerMillis;

        let oldRemaining = Number.MAX_SAFE_INTEGER;
        if (oldValue) {
            // @ts-ignore
            oldRemaining = (oldValue * 60 * 1000) - timerMillis;
        }

        handleTimerChange(newRemaining, oldRemaining);
    });

    function handleTimerChange(newRemainingMillis, oldRemainingMillis) {
        const NOTIFY_TIMES = [10, 7.5, 5, 2, 1, 0.5];

        // Only handle changes if we are in round
        if (phase != Phase.ROUND) {
            return;
        }

        // Check if time has expired and we need to change phase
        if (oldRemainingMillis > 0 && newRemainingMillis <= 0) {
            phase = Phase.NOT_IN_ROUND;

            // Flag runners as on their final runs
            // @ts-ignore
            if (runner1.value?.steam) {
                // @ts-ignore
                playerOnFinalRun[runner1.value?.steam] = true;
            }
            // @ts-ignore
            if (runner1.value?.steam) {
                // @ts-ignore
                playerOnFinalRun[runner2.value?.steam] = true;
            }

            // @ts-ignore
            [...server.clients.keys()].forEach(id => {
                let numericId = Number(id);
                server.sendChatMessage(numericId, 0, "Time's up! Final Run!");
            });

            // @ts-ignore
            // nodecg.extensions['nodecg-speedcontrol'].sendMessage('timerStop', { id: undefined, forfeit: undefined });
        }

        // Check if the timer passed a notify point we need to process
        NOTIFY_TIMES.forEach(notifyTime => {
            let notifyMillis = notifyTime * 60 * 1000;

            if (oldRemainingMillis > notifyMillis && newRemainingMillis <= notifyMillis) {
                // @ts-ignore
                [...server.clients.keys()].forEach(id => {
                    let numericId = Number(id);
                    server.sendChatMessage(numericId, 0, `Time remaining: ${formatTime(notifyMillis / 1000)}`);
                });
            }
        });
    }

    function formatTime(totalSeconds) {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        if (minutes > 0) {
            if (seconds < 10) {
                return minutes + ':0' + seconds.toFixed(2);
            } else {
                return minutes + ':' + seconds.toFixed(2);
            }
        } else {
            return seconds.toFixed(2);
        }
    }
}
