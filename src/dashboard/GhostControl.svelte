<script lang="ts">
    const ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");

    let playerList = ghostClients.value ?? [];
    ghostClients.on('change', (newValue) => playerList = newValue ?? []);

    let player1Steam = runner1.value?.steam ?? "";
    let player2Steam = runner2.value?.steam ?? "";

    runner1.on('change', (newValue) => {
        player1Steam = newValue?.steam ?? "";
    });
    runner2.on('change', (newValue) => {
        player2Steam = newValue?.steam ?? "";
    });

    $: (player1Steam, player2Steam), refreshSteam();

    function refreshSteam() {
        if (runner1.value && runner1.value.steam != player1Steam) {
            runner1.value.steam = player1Steam;
        }
        if (runner2.value && runner2.value.steam != player2Steam) {
            runner2.value.steam = player2Steam;
        }
    }
</script>

<div class="list-container">
    <div style="display: flex; flex-flow: row nowrap; justify-content: space-between">
        Connected Clients
        <button>Reset Runs</button>
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
            </tr>
        {/each}
    </table>
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
