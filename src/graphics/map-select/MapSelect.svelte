<script lang="ts">
    import 'virtual:fonts.css';
    import spinAudioUrl from "./ui_coop_hud_focus_02.wav";
    import selectAudioUrl from "./startup_02_01.wav";

    import {onMount} from "svelte";
    import {flip} from "svelte/animate";
    import {tweened} from "svelte/motion";
    import {cubicOut} from "svelte/easing";

    import {fetchWrs, globalAllowedMaps} from "../../shared/allmaps";
    import {replicantStores} from "../../shared/replicants";

    const replicants = replicantStores(nodecg);

    const runner1 = replicants.runner1;
    const runner2 = replicants.runner2;

    const player1Vetos = replicants.player1Vetos;
    const player2Vetos = replicants.player2Vetos;
    const currentMap = replicants.currentMap;

    let allowedMaps = [];

    let selectedMap = undefined;
    let finished = false;
    let flash = false;
    let showRuns = false;

    function calculateAllowedMaps() {
        let newAllowed = [];

        globalAllowedMaps.forEach(map => {
            if ($player1Vetos && $player1Vetos.some(m => m === map.name)) {
                return;
            }
            if ($player2Vetos && $player2Vetos.some(m => m === map.name)) {
                return;
            }

            newAllowed.push(map);
        });

        allowedMaps = newAllowed;
        if ($currentMap) {
            startVelocity = calculateStartingVel($currentMap);
        }
    }

    $: ($player1Vetos, $player2Vetos), calculateAllowedMaps();
    calculateAllowedMaps();

    let startTime;
    let startVelocity;
    const deceleration = 3;

    const audioContext = new AudioContext();
    let spinAudioBuffer;
    let selectAudioBuffer;

    function playSpin() {
        let source = audioContext.createBufferSource();
        source.buffer = spinAudioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }

    function playSelect() {
        let source = audioContext.createBufferSource();
        source.buffer = selectAudioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }

    fetch(spinAudioUrl).then(res => res.arrayBuffer().then(data => {
        audioContext.decodeAudioData(data, (buffer) => {
            spinAudioBuffer = buffer;
        });
    }));
    fetch(selectAudioUrl).then(res => res.arrayBuffer().then(data => {
        audioContext.decodeAudioData(data, (buffer) => {
            selectAudioBuffer = buffer;
        });
    }));

    function tickSelection() {
        let time = (Date.now() - startTime) / 1000;
        let position = (startVelocity * time) - (0.5 * deceleration * time * time);
        console.log("Landed on position", position);

        let newSelectedMap = Math.floor(position) % allowedMaps.length;
        console.log("Selected map", newSelectedMap);

        if (newSelectedMap !== selectedMap) {
            selectedMap = newSelectedMap;

            playSpin();
        }

        console.log("Comparing", startVelocity, "to", ( deceleration * time))
        if (startVelocity > (deceleration * time)) {
            setTimeout(tickSelection, 1000/60);
        } else {
            finished = true;
            playSelect();
            flash = true;

            let flasher = () => {
                if (finished) {
                    flash = !flash;
                    setTimeout(flasher, 1000);
                }
            };
            setTimeout(flasher, 1000);
        }
    }

    function calculateStartingVel(map) {
        let index = undefined;
        let i = 0;
        for (let m of allowedMaps) {
            if (m.mapFile === map.mapFile) {
                index = i;
                break;
            }
            i++;
        }

        if (index === undefined) {
            console.log("Couldn't find map :(", map, allowedMaps);
            return 0;
        }
        console.log("Found at index", index);
        console.log(allowedMaps.length * 3);
        console.log((allowedMaps.length * 3) + index);

        let desiredPosition = (allowedMaps.length * 3) + index + (Math.random() * 0.7) + 0.2;
        console.log("Targeting position", desiredPosition);

        return Math.sqrt(2 * deceleration * desiredPosition);
    }

    function roll(newValue) {
        if (newValue && $player1Vetos.length > 0 && $player2Vetos.length > 0) {
            startVelocity = calculateStartingVel(newValue);
            startTime = Date.now();
            finished = false;
            showRuns = false;
            tickSelection();
        } else {
            selectedMap = undefined;
            finished = false;
        }
    }

    $: ($currentMap), roll($currentMap);

    function mapByName(name) {
        return globalAllowedMaps.find(m => m.name === name) ?? globalAllowedMaps[0];
    }

    let bigMapPlaceholder;
    let bigMapMover;
    let selectedX;
    let selectedY;
    let selectedWidth;
    let selectedHeight;

    nodecg.listenFor("showRuns", () => {
        const duration = 750;
        let mapElement = document.getElementById(`map-element-${selectedMap}`);

        selectedX = tweened(mapElement.offsetLeft, {
            duration: duration,
            easing: cubicOut
        });
        selectedY = tweened(mapElement.offsetTop, {
            duration: duration,
            easing: cubicOut
        });
        selectedWidth = tweened(mapElement.offsetWidth, {
            duration: duration,
            easing: cubicOut
        });
        selectedHeight = tweened(mapElement.offsetHeight, {
            duration: duration,
            easing: cubicOut
        });

        showRuns = true;

        selectedX.set(bigMapPlaceholder.offsetLeft);
        selectedY.set(bigMapPlaceholder.offsetTop);
        selectedWidth.set(bigMapPlaceholder.offsetWidth);
        selectedHeight.set(bigMapPlaceholder.offsetHeight);

        setTimeout(() => document.getElementById("wrVideo").play(), 2000);
    });

    onMount(async () => await fetchWrs());
</script>

<div class="content">
    <div class="banBox">
        <div class="userName">{$runner1?.displayName ?? ""}</div>
        <img class="avatar" src={$runner1?.avatar ?? ""}>
        <div class="bannedText">Banned</div>
        {#each $player1Vetos ?? [] as map}
            {#if map}
                <div class="map">
                    <div class="mapBG" style={`background-image: url("${mapByName(map).thumbnailUrl}");`}></div>
                    {map}
                </div>
            {/if}
        {/each}
    </div>
    <div class="mapSpinner">
        <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; z-index: -1; overflow: hidden">
            <div class="map bigMap" bind:this={bigMapPlaceholder}></div>
        </div>
        <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 5; overflow: hidden">
            {#if selectedMap !== undefined}
                <div class="map"
                     class:fullbleedMap={showRuns}
                     class:invisible={!showRuns}
                     bind:this={bigMapMover} style={`position: aboslute; left: ${$selectedX}px; top: ${$selectedY}px; width: ${$selectedWidth}px; height: ${$selectedHeight}px;`}>
                    <div class="mapBG" style={`background-image: url("${allowedMaps[selectedMap].thumbnailUrl}");`}></div>
                    {allowedMaps[selectedMap].name}
                    <div class:mapWR={showRuns} style="font-size: 50px; width: 65rem">
                        <div class="wrContainer">
                            World Record: {allowedMaps[selectedMap].wrTime} by {allowedMaps[selectedMap].wrUser}
                            <video id="wrVideo" src={allowedMaps[selectedMap].wrVideo} style="width: 100%; margin-top: 2rem; border: solid white 3px;"></video>
                            <div style="height: 50px"></div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        {#each allowedMaps as map, i (i)}
            <div id={`map-element-${i}`}
                 class="map"
                 style={showRuns && selectedMap === i ? "opacity: 0" : ""}
                 class:unselected={selectedMap !== undefined && selectedMap !== i}
                 class:selected={selectedMap === i}
                 class:final={finished}
                 class:flash={flash}>
                <div class="mapBG" style={`background-image: url("${map.thumbnailUrl}");`}></div>
                {map.name}
            </div>
        {/each}
    </div>
    <div class="banBox">
        <div class="userName">{$runner2?.displayName ?? ""}</div>
        <img class="avatar" src={$runner2?.avatar ?? ""}>
        <div class="bannedText">Banned</div>
        {#each $player2Vetos ?? [] as map}
            {#if map}
                <div class="map">
                    <div class="mapBG" style={`background-image: url("${mapByName(map).thumbnailUrl}");`}></div>
                    {map}
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .invisible {
        opacity: 0;
    }

    .fullbleedMap {
        transition: font-size 0.75s !important;
        font-size: 80px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
    }

    .mapWR {
        transition: min-height 1.5s;
        min-height: 85%;

        overflow: hidden;
    }

    .wrContainer {
        width: 60rem;
        height: 1000px;

        margin-left: auto;
        margin-right: auto;

        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
    }

    .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        display: flex;
        flex-flow: row nowrap;
    }

    .userName {
        width: 100%;
        margin: 5% 0;

        font-family: 'D-DIN Condensed Bold';
        font-size: 60px;
        text-align: center;
        color: white;
    }

    .bannedText {
        width: 100%;

        display: flex;
        align-items: center;
        justify-content: center;

        font-family: 'D-DIN';
        font-size: 40px;
        color: white;
    }

    .avatar {
        margin: 5% 20%;
        box-shadow: #212121 0 0 10px;

        border: solid white 3px;
    }

    .banBox {
        flex-basis: 0;

        min-width: 15%;
        height: 100%;

        display: flex;
        flex-flow: column nowrap;
        align-items: center;
    }

    .mapSpinner {
        position: relative;

        flex-grow: 1;

        height: 100%;

        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        align-items: center;
    }

    .map {
        position: relative;
        width: 10rem;
        min-height: 6rem;

        margin: 0.75rem;
        padding: 0.5rem;

        border: solid white 3px;

        text-align: center;

        font-family: 'D-DIN Condensed Bold';
        font-size: 2rem;
        color: white;

        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;

        transition: 0.3s;
    }

    .bigMap {
        min-width: 167%;
        min-height: 100%;

        margin: 0;
    }

    .unselected {
        filter: brightness(0.5);
        transition: 0.3s;
    }

    .selected {
        filter: brightness(1.0);
        transition: 0s;
    }

    .final:not(.unselected) {
        transition: 0.3s;
    }

    .flash.selected {
        border: solid lawngreen 3px;
        color: lawngreen;
    }

    .mapBG {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;

        background-size: cover;
        filter: blur(3px) brightness(0.8);
        z-index: -1;
    }
</style>
