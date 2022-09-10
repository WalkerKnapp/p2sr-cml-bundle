<script lang="ts">
    const WEBSOCKET_PASSWORD = "password_here";

    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const runner1 = nodecg.Replicant("runner1", { persistent: false });
    const runner2 = nodecg.Replicant("runner2", { persistent: false });

    const times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
    const attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false});

    const streamDelay = nodecg.Replicant("streamDelay", { defaultValue: 0, persistent: false });

    let playerList = [];

    let player1Steam = runner1.value?.steam ?? "";
    let player2Steam = runner2.value?.steam ?? "";

    let delay = streamDelay.value;

    let socket = new WebSocket("ws://stream.portal2.sr:8765/restream/" + WEBSOCKET_PASSWORD);

    socket.addEventListener('message', (event: MessageEvent) => {
        let message = event.data.split(" ");

        switch (message[0]) {
            case "delay":
                let delay = message[1];
                if (delay) {
                    streamDelay.value = Number(delay)
                } else {
                    console.log("Invalid stream delay: " + delay);
                }
                break;
            default:
                console.log("Invalid command from sync websocket: " + message[0])
        }
    });

    // Setup reactivity
    ghostClients.on('change', () => refreshPlayerList());
    times.on('change', () => refreshPlayerList());
    attempts.on('change', () => refreshPlayerList());

    runner1.on('change', (newValue) => {
        player1Steam = newValue?.steam ?? "";
        refreshPlayerList();
    });
    runner2.on('change', (newValue) => {
        player2Steam = newValue?.steam ?? "";
        refreshPlayerList();
    });

    streamDelay.on('change', (newValue) => delay = newValue);

    $: (player1Steam, player2Steam), refreshSteam();

    function refreshPlayerList() {
        let newPlayerList = [];

        if (!ghostClients.value) {
            playerList = [];
        }

        ghostClients.value.forEach(player => {
            console.log("A", player);
            let newPlayer = Object.assign({}, player);
            console.log("B", newPlayer);

            if (times.value && attempts.value) {
                newPlayer.runs = (times.value[newPlayer.name]?.length ?? 0) + "/" + (attempts.value[newPlayer.name] ?? 0);
            } else {
                newPlayer.runs = "0/0";
            }

            newPlayerList.push(newPlayer);
        });

        playerList = newPlayerList;
    }

    function refreshSteam() {
        if (runner1.value && runner1.value.steam != player1Steam) {
            runner1.value.steam = player1Steam;
        }
        if (runner2.value && runner2.value.steam != player2Steam) {
            runner2.value.steam = player2Steam;
        }
    }

    function resetRuns() {
        times.value = {};
        attempts.value = {};
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
        {#each playerList as player}
            <tr>
                <td class="list-cell">{player.id}</td>
                <td class="list-cell">{player.name}</td>
                <td class="list-cell">{player.map}</td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p1`} name="player1" checked={player1Steam === player.name} on:click={() => player1Steam = player.name}></td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p2`} name="player2" checked={player2Steam === player.name} on:click={() => player2Steam = player.name}></td>
                <td class="list-cell">{player.raceReady}</td>
                <td class="list-cell">{player.runs}</td>
            </tr>
        {/each}
    </table>
    <hr>
    Sequencing<br>
    <button on:click={startPractice}>Start Practice Period (Immediate)</button>
    <button on:click={startRound}>Start Round (5 Second Countdown)</button>
    <hr>
    Stream Delay Management
    <button on:click={forceResync}>Force Resync</button>
    <span>Current Delay: {delay}</span>
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
