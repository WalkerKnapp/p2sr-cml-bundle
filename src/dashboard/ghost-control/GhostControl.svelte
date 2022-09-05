<script lang="ts">
    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");

    const times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
    const attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false});

    const runner1Delay = nodecg.Replicant("runner1Delay", { defaultValue: 0.0, persistent: false });
    const runner2Delay = nodecg.Replicant("runner2Delay", { defaultValue: 0.0, persistent: false });

    let playerList = [];

    let player1Steam = runner1.value?.steam ?? "";
    let player2Steam = runner2.value?.steam ?? "";

    // Setup reactivity
    ghostClients.on('change', () => refreshPlayerList());
    times.on('change', () => refreshPlayerList());
    attempts.on('change', () => refreshPlayerList());
    runner1Delay.on('change', () => refreshPlayerList());
    runner2Delay.on('change', () => refreshPlayerList());

    runner1.on('change', (newValue) => {
        player1Steam = newValue?.steam ?? "";
        refreshPlayerList();
    });
    runner2.on('change', (newValue) => {
        player2Steam = newValue?.steam ?? "";
        refreshPlayerList();
    });

    $: (player1Steam, player2Steam), refreshSteam();

    function refreshPlayerList() {
        let newPlayerList = [];

        if (!ghostClients.value) {
            playerList = [];
        }

        for (let player in ghostClients.value) {
            let newPlayer = Object.assign({}, player);

            if (times.value && attempts.value) {
                newPlayer.runs = (times.value[newPlayer.name]?.length ?? 0) + "/" + (attempts.value[newPlayer.name] ?? 0);
            } else {
                newPlayer.runs = "0/0";
            }

            if (runner1.value?.steam == newPlayer.name && runner1Delay.value) {
                newPlayer.delay = runner1Delay.value;
            } else if (runner2.value?.steam == newPlayer.name && runner2Delay.value) {
                newPlayer.delay = runner2Delay.value;
            } else {
                newPlayer.delay = "";
            }

            newPlayerList.push(newPlayer);
        }

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

    }

    function startRound() {

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
            <th class="list-cell">Delay</th>
        </tr>
        {#each playerList as player}
            <tr>
                <td class="list-cell">{player.id}</td>
                <td class="list-cell">{player.name}</td>
                <td class="list-cell">{player.map}</td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p1`} name="player1" checked={player1Steam === player.name} on:click={() => player1Steam = player.name}></td>
                <td class="list-cell"><input type="radio" id={`${player.id}-p2`} name="player2" checked={player1Steam === player.name} on:click={() => player2Steam = player.name}></td>
                <td class="list-cell">{player.raceReady}</td>
                <td class="list-cell">{player.runs}</td>
                <td class="list-cell">{player.delay}</td>
            </tr>
        {/each}
    </table>
    <hr>
    Sequencing<br>
    <button on:click={startPractice}>Start Practice Period (Immediate)</button>
    <button on:click={startRound}>Start Round (5 Second Countdown)</button>
    <hr>
    Stream Delay Management
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
</style>
