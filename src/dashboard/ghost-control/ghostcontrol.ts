import "svelte";
import GhostControl from './GhostControl.svelte';
const app = new GhostControl({
    target: document.body
});
export default GhostControl;
