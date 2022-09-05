<script lang="ts">
    import RunTimes from "./RunTimes.svelte";
    import Fa from 'svelte-fa/src/fa.svelte';
    import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

    const timer = nodecg.Replicant("timer", "nodecg-speedcontrol");
    const timerDuration = nodecg.Replicant('timer-duration', "p2cml");
    const globalCommentators = nodecg.Replicant("commentators");
    const runner1 = nodecg.Replicant("runner1");
    const runner2 = nodecg.Replicant("runner2");
    const times = nodecg.Replicant("times");

    // Track runner steam accounts/display names
    let runner1Name = runner1.value?.displayName ?? "";
    let runner2Name = runner2.value?.displayName ?? "";
    let runner1Steam = runner1.value?.steam ?? "";
    let runner2Steam = runner2.value?.steam ?? "";
    let runner1Score = runner1.value?.score ?? 0;
    let runner2Score = runner2.value?.score ?? 0;
    let runner1Pb = formatTime(times.value?.[runner1Steam]?.[0]?.totalSeconds);
    let runner2Pb = formatTime(times.value?.[runner2Steam]?.[0]?.totalSeconds);

    console.log(times.value);
    console.log("Pbs initially set", runner1Pb, runner2Pb);

    runner1.on('change', (newValue, oldValue) => {
        runner1Name = newValue.displayName;
        runner1Steam = newValue.steam;
        runner1Pb = formatTime(times.value?.[runner1Steam]?.[0]?.totalSeconds);
        console.log(times.value);
        console.log("Pbs set", runner1Pb);
    });
    runner2.on('change', (newValue, oldValue) => {
        runner2Name = newValue.displayName;
        runner2Steam = newValue.steam;
        runner2Pb = formatTime(times.value?.[runner2Steam]?.[0]?.totalSeconds);
    });
    times.on('change', (newValue, oldValue) => {
        runner1Pb = formatTime(newValue?.[runner1Steam]?.[0]?.totalSeconds);
        runner2Pb = formatTime(newValue?.[runner2Steam]?.[0]?.totalSeconds);
        console.log(runner1Steam, times.value?.[runner1Steam]);
        console.log("Pbs set", runner1Pb);
    });

    // Track commentators
    let commentatorNames = globalCommentators.value !== undefined ? globalCommentators.value : [];

    globalCommentators.on('change', (newValue, oldValue) => {
        commentatorNames = newValue;
    });

    // Track timer
    let timerText = formatTimer(timerDuration.value, timer.value);
    timer.on('change', (newValue, oldValue) => {
       timerText = formatTimer(timerDuration.value, newValue);
    });
    timerDuration.on('change', (newValue) => {
        timerText = formatTimer(newValue, timer.value);
    });

    function formatTimer(duration, timerVal) {
        if (!duration) {
            console.log("Timer Duration not set");
            return "";
        }

        let remainingMillis;
        if (timerVal) {
            remainingMillis = Math.max((duration * 60 * 1000) - timerVal.milliseconds, 0);
        } else {
            remainingMillis = (duration * 60 * 1000);
        }

        let minutes = Math.floor(remainingMillis / (60 * 1000));
        let seconds = Math.floor((remainingMillis % (60 * 1000)) / 1000);

        if (seconds >= 10) {
            return minutes + ":" + seconds.toFixed(0);
        } else {
            return minutes + ":0" + seconds.toFixed(0);
        }
    }

    function formatTime(totalSeconds) {
        if (totalSeconds === undefined) {
            return "None"
        }

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
</script>

<div class="container" style="width: 100%;height:100%;top:0;left:0;position: absolute">
    <div class="streams">
        <div class="stream"></div>
        <!-- Spacer --> <div style="width: 2px"></div>
        <div class="stream"></div>
    </div>

    <div class="info">
        <div class="playerInfo">
            <div class="namecard">{runner1Name}</div>
            <div class="scoreContainer">
                <div class="racePb">Race PB: {runner1Pb}</div>
                <!-- Spacer --> <div style="width: 2px"></div>
                <div class="raceScore">{runner1Score}</div>
            </div>
            <RunTimes steam={runner1Steam}/>
        </div>

        <div class="centerInfo">
            <div class="timer">{timerText}</div>

            <div>
                {#each commentatorNames as commentator}
                    <div class="commentator">
                        <div class="microphone"><Fa icon={faMicrophone} scale="1.2" size="3x" color="white"/></div>
                        <div class="commName">{commentator}</div>
                    </div>
                {/each}
            </div>

            <!-- Spacer --> <div style="height: 125px"></div>
        </div>

        <div class="playerInfo">
            <div class="namecard">{runner2Name}</div>
            <div class="scoreContainer">
                <div class="raceScore">{runner2Score}</div>
                <!-- Spacer --> <div style="width: 2px"></div>
                <div class="racePb">Race PB: {runner2Pb}</div>
            </div>
            <RunTimes steam={runner2Steam}/>
        </div>
    </div>
</div>

<style>
    /* Full container spacing */

    .container {
        width: 100%;
        height: 100%;

        position: absolute;
        top: 0;
        left: 0;

        display: flex;
        flex-flow: column nowrap;
    }

    /* Black box/placeholders for streams */

    .streams {
        width: 100%;

        flex-basis: 0;
        flex-grow: 1;

        display: flex;
        flex-flow: row nowrap;
    }

    .stream {
        flex-grow: 1;
        background-color: black;
    }

    /* Info cards */

    .info {
        width: 100%;
        box-sizing: border-box;
        padding: 2px;

        flex-basis: 0;
        flex-grow: 1;

        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }

    .playerInfo {
        width: 450px;
    }

    .namecard {
        width: 100%;
        height: 75px;

        background-color: rgba(38, 38, 38, 0.75);

        font-family: 'D-DIN Condensed Bold';
        font-size: 60px;
        line-height: 75px;
        text-align: center;
        color: white;
    }

    .scoreContainer {
        width: 100%;
        height: 75px;

        display: flex;
        flex-flow: row nowrap;

        margin: 2px 0;
    }

    .raceScore {
        height: 100%;
        aspect-ratio: 1;

        background-color: rgba(38, 38, 38, 0.75);

        font-family: 'D-DIN Condensed Bold';
        font-size: 60px;
        line-height: 75px;
        text-align: center;
        color: white;
    }

    .racePb {
        height: 100%;
        flex-grow: 1;

        background-color: rgba(38, 38, 38, 0.75);

        font-family: 'D-DIN';
        font-size: 45px;
        line-height: 75px;
        text-align: center;
        color: white;
    }

    /* Center info column */

    .centerInfo {
        display: flex;
        flex-flow: column nowrap;

        justify-content: space-between;
        align-items: center;
    }

    .timer {
        width: 200px;
        height: 100px;

        background-color: rgba(38, 38, 38, 0.75);

        font-family: 'D-DIN Condensed Bold';
        font-size: 80px;
        line-height: 100px;
        text-align: center;
        color: white;
    }

    .commentator {
        width: 500px;
        height: 75px;

        margin: 2px 0;

        background-color: rgba(38, 38, 38, 0.75);

        display: flex;
        flex-flow: row nowrap;

        position: relative;
    }

    .microphone {
        height: 100%;
        aspect-ratio: 1;
        padding: 5px;
        box-sizing: border-box;

        display: flex;
        justify-content: center;
        align-items: center;

        top: 0;
        left: 0;

        /* NOTE: Comment out this line to go back to the commentator name being moved by the mic icon */
        /* position: absolute; */
    }

    .commName {
        flex-basis: 0;
        flex-grow: 1;

        font-family: 'D-DIN Condensed Bold';
        font-size: 60px;
        line-height: 75px;
        text-align: center;
        color: #ffffff;
    }
</style>


