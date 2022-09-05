import "svelte";
import MapControl from './MapControl.svelte';
const app = new MapControl({
    target: document.body
});
export default MapControl;
