<script lang="ts">
    const players = nodecg.Replicant("players");

    let playerList = players.value ?? [];
    players.on('change', (newValue) => playerList = newValue ?? []);
</script>

<div class="list-container">
    Ghost Server Players
    <table>
        <tr>
            <th>ID</th>
            <th>Steam Name</th>
            <th>Current Map</th>
            <th>Player 1</th>
            <th>Player 2</th>
        </tr>
        {#each playerList as player}
            <tr>
                <td>{player.id}</td>
                <td>{player.name}</td>
                <td>{player.map}</td>
                <td><input type="radio" id={`${player.id}-p1`} name="player1"></td>
                <td><input type="radio" id={`${player.id}-p2`} name="player2"></td>
            </tr>
        {/each}
    </table>
</div>

<style>
    .list-container {
        width: 100%;
        height: 100%;
    }
</style>
