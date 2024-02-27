"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplicantStore = void 0;
class ReplicantStore {
    constructor(replicant) {
        this.listeners = new Set();
        this.replicant = replicant;
        replicant.on('change', (newValue, oldValue) => {
            console.log("Replicant update", this.listeners.size, newValue);
            this.listeners.forEach(listener => {
                listener(newValue);
            });
        });
    }
    subscribe(run, _invalidate) {
        console.log("Store subscribe", this.replicant);
        this.listeners.add(run);
        if (this.replicant.status === 'declared') {
            run(this.replicant.value);
        }
        return () => this.listeners.delete(run);
    }
    set(value) {
        console.log("Store set");
        this.replicant.value = value;
    }
    update(updater) {
        console.log("Store update");
        this.replicant.value = updater(this.replicant.value);
    }
}
exports.ReplicantStore = ReplicantStore;
