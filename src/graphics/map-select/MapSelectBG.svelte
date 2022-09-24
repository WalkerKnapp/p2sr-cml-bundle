<div class="content">
    <div class="banBox"></div>
    <div class="mapSpinner"></div>
    <div class="banBox"></div>
</div>

<style>
    .content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        display: flex;
        flex-flow: row nowrap;

        background-image: linear-gradient(120deg, rgba(38, 166, 212) 0%, rgba(208, 106, 6) 100%);
    }

    .banBox {
        flex-basis: 0;

        min-width: 15%;
        height: 100%;

        display: flex;
        flex-flow: column nowrap;

        background-color: rgba(110, 13, 13, 0.75);;
    }

    .mapSpinner {
        flex-grow: 1;

        height: 100%;
    }
</style>
