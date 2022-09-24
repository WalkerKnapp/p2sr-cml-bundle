import "svelte";
import TwoPlayerOverlay from './TwoPlayerOverlay.svelte';
const app = new TwoPlayerOverlay({
    target: document.body
});
export default TwoPlayerOverlay;
