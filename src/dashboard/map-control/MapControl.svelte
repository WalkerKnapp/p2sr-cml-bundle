<script lang="ts">
    import {globalAllowedMaps} from "../../shared/allmaps";
    import {replicantStores} from "../../shared/replicants";

    const replicants = replicantStores(nodecg);

    const player1Vetos = replicants.player1Vetos;
    const player2Vetos = replicants.player2Vetos;
    const currentMap = replicants.currentMap;

    function rerollMap() {
        let mapPool = globalAllowedMaps
            .filter(m => !$player1Vetos.some(m2 => m.name === m2))
            .filter(m => !$player2Vetos.some(m2 => m.name === m2));

        $currentMap = mapPool[Math.floor(Math.random() * mapPool.length)];

        nodecg.sendMessageToBundle('currentMap', 'p2cml', $currentMap.name);
    }
</script>

<div>
    <div class="vetos">
        <div class="veto">
            Player 1's Vetos
            {#each $player1Vetos ?? [] as veto, i}
                <select bind:value={$player1Vetos[i]} style="max-width: fit-content">
                    {#each globalAllowedMaps as map}
                        <option value={map.name}>{map.name}</option>
                    {/each}
                </select>
            {/each}
        </div>
        <div class="veto">
            Player 2's Vetos
            {#each $player2Vetos ?? [] as veto, i}
                <select bind:value={$player2Vetos[i]} style="max-width: fit-content">
                    {#each globalAllowedMaps as map}
                        <option value={map.name}>{map.name}</option>
                    {/each}
                </select>
            {/each}
        </div>
    </div>
    <div class="rerollBox">
        Current Map: {$currentMap?.name ?? "None"}
        <button on:click={rerollMap} style="max-width: fit-content">Reroll Map</button>
        <button on:click={() => $currentMap = undefined} style="max-width: fit-content">Reset Map</button>
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
