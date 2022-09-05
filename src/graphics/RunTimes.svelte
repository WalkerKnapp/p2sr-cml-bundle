<script lang="ts">
    import 'virtual:fonts.css';
    import { fly } from "svelte/transition"

    // Global parameters
    export let rightSide = false;
    export let steam;
    const globalTimes = nodecg.Replicant("times", { defaultValue: {}, persistent: false });

    // Local parameters
    let displayTimes;
    let currentPb;

    // Setup reactivity
    globalTimes.on('change', () => refreshTimes());
    $: (steam), refreshTimes();

    function refreshTimes() {
        if (globalTimes.value !== undefined && globalTimes.value[steam] !== undefined) {
            let fullTimesList = globalTimes.value[steam];

            console.log("Considering full times list", fullTimesList);

            // Display only times that have been achieved in the last 3 seconds
            let newTimes = [];
            let newCurrentPb = undefined;

            fullTimesList.forEach(time => {
                if (Date.now() - time.achieved < 4000) {
                    newTimes.push(time.totalSeconds);

                    // Schedule another refresh a bit after we expect this time to expire
                    setTimeout(refreshTimes, (4000 - (Date.now() - time.achieved)) + 100);
                }

                if (!newCurrentPb || time.totalSeconds < newCurrentPb) {
                    newCurrentPb = time.totalSeconds;
                }
            });

            displayTimes = newTimes;
            currentPb = newCurrentPb;
        } else {
            console.log("Times undef", steam, globalTimes.value);
            displayTimes = [];
        }
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
</script>

<div class="times">
    <!-- Show up to 3 runs at the same time -->
    {#each displayTimes.slice(0, 3) as time, i (time)}
        <div class="time" class:pb={time === currentPb} class:rightTime={rightSide} transition:fly="{{ x: rightSide ? 200 : -200, duration: 500 }}">
            {formatTime(time)}
        </div>
    {/each}
</div>

<style>
    .times {
        display: flex;
        flex-flow: column nowrap;
    }

    .time {
        background-color: rgba(38, 38, 38, 0.75);
        color: white;

        line-height: 75px;
        font-size: 60px;
        font-family: 'D-DIN Condensed Bold';
        text-align: center;

        display: flex;
        justify-content: left;
        align-items: center;

        margin-bottom: 0.5rem;

        max-width: fit-content;
        height: 75px;

        padding: 0 30px;
        box-sizing: border-box;
    }

    .rightTime {
        justify-content: right;
    }

    .pb {
        color: rgb(211, 181, 21)
    }
</style>
