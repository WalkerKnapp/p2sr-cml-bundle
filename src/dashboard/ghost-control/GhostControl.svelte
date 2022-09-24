<script lang="ts">
    import {replicantStores} from "../../shared/replicants";

    const WEBSOCKET_PASSWORD = "password_here";

    const replicants = replicantStores(nodecg);

    const ghostClients = replicants.ghostClients;
    const runner1 = replicants.runner1;
    const runner2 = replicants.runner2;

    const times = replicants.times;
    const attempts = replicants.attempts;

    const streamDelay = replicants.streamDelay;

    let socket = new WebSocket("ws://stream.portal2.sr:8765/restream/" + WEBSOCKET_PASSWORD);

    socket.addEventListener('message', (event: MessageEvent) => {
        let message = event.data.split(" ");

        switch (message[0]) {
            case "delay":
                let delay = message[1];
                if (delay) {
                    $streamDelay = Number(delay)
                } else {
                    console.log("Invalid stream delay: " + delay);
                }
                break;
            default:
                console.log("Invalid command from sync websocket: " + message[0])
        }
    });

    function resetRuns() {
        $times = {};
        $attempts = {};
    }

    function startPractice() {
        nodecg.sendMessage("startPractice");
    }

    function startRound() {
        nodecg.sendMessage("startRound");
    }

    function forceResync() {
        socket.send("sync");
    }
</script>

<div class="list-container">
    <div style="display: flex; flex-flow: row nowrap; justify-content: space-between">
        Connected Clients
        <button on:click={resetRuns}>Reset Runs</button>
    </div>
    <hr>
    <table style="width: 100%">
        <tr>
            <th class="list-cell">ID</th>
            <th class="list-cell">Steam Name</th>
            <th class="list-cell">Map</th>
            <th class="list-cell">P1</th>
            <th class="list-cell">P2</th>
            <th class="list-cell">Ready</th>
            <th class="list-cell">Runs</th>
        </tr>
        {#each $ghostClients ?? [] as player}
            <tr>
                <td class="list-cell">{player.id}</td>
                <td class="list-cell">{player.name}</td>
                <td class="list-cell">{player.map}</td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p1`} name="player1" checked={$runner1?.steam === player.name} on:click={() => $runner1.steam = player.name}></td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p2`} name="player2" checked={$runner2?.steam === player.name} on:click={() => $runner2.steam = player.name}></td>
                <td class="list-cell">{player.raceReady}</td>
                <td class="list-cell">{$times?.[player.name]?.length ?? 0}/{$attempts?.[player.name] ?? 0}</td>
            </tr>
        {/each}
    </table>
    <hr>
    Sequencing<br>
    <button on:click={startPractice}>Start Practice Period (Immediate)</button>
    <button on:click={startRound}>Start Round (5 Second Countdown)</button>
    <hr>
    Stream Delay Management
    <br>
    <span>Current Delay: <input bind:value={$streamDelay} type="number"> </span>
    <button on:click={forceResync}>Force Resync</button>
</div>

<style>
    .list-container {
        width: 100%;
        height: 100%;
    }

    .list-cell {
        text-align: center;
        margin: auto;
    }

    .delay-box {
        flex-basis: 0;
        flex-grow: 1;
        height: 100%;

        text-align: center;
        line-height: 5rem;
    }
</style>
