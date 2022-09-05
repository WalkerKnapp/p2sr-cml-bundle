<script lang="ts">
    import {globalAllowedMaps} from "../../shared/allmaps";

    const VETOS_PER_PLAYER = 5;

    let player1Vetos = Array(VETOS_PER_PLAYER);
    let player2Vetos = Array(VETOS_PER_PLAYER);

    const currentMap = nodecg.Replicant("currentMap", { persistent: false })

    let currentMapName = "None";
    currentMap.on('change', (newValue) => currentMapName = newValue?.name ?? "None");

    function rerollMap() {
        let mapPool = globalAllowedMaps
            .filter(m => !player1Vetos.includes(m))
            .filter(m => !player2Vetos.includes(m));

        currentMap.value = mapPool[Math.floor(Math.random() * mapPool.length)];

        nodecg.sendMessageToBundle('currentMap', 'p2cml', currentMap.value.name);
    }
</script>

<div>
    <div class="vetos">
        <div class="veto">
            Player 1's Vetos
            {#each player1Vetos as veto}
                <select bind:value={veto} style="max-width: fit-content">
                    {#each globalAllowedMaps as map}
                        <option value={map}>{map.name}</option>
                    {/each}
                </select>
            {/each}
        </div>
        <div class="veto">
            Player 2's Vetos
            {#each player2Vetos as veto}
                <select bind:value={veto} style="max-width: fit-content">
                    {#each globalAllowedMaps as map}
                        <option value={map}>{map.name}</option>
                    {/each}
                </select>
            {/each}
        </div>
    </div>
    <div class="rerollBox">
        <button on:click={rerollMap} style="max-width: fit-content">Reroll Map</button>
        Current Map: {currentMapName}
    </div>
</div>

<style>
    .vetos {
        display: flex;
        flex-flow: column nowrap;
    }

    .veto {
        display: flex;
        flex-flow: column nowrap;
    }

    .rerollBox {
        margin-top: 2rem;
        display: flex;
        flex-flow: column nowrap;
    }
</style>
