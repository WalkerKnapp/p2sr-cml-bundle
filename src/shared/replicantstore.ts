import {Replicant} from "./replicants";
import {writable} from "svelte/store"

export class ReplicantStore<T> {
    replicant: Replicant<T>;
    listeners: Set<(value: T) => void> = new Set<(value: T) => void>();

    constructor(replicant: Replicant<T>) {
        this.replicant = replicant;

        replicant.on('change', (newValue: T, oldValue: T) => {
            console.log("Replicant update", this.listeners.size, newValue);

            this.listeners.forEach(listener => {
                listener(newValue);
            });
        });
    }

    subscribe(run: (value: T) => void, _invalidate?: (value?: T) => void): () => void {
        console.log("Store subscribe", this.replicant);

        this.listeners.add(run);

        if (this.replicant.status === 'declared') {
            run(this.replicant.value);
        }

        return () => this.listeners.delete(run);
    }

    set(value: T): void {
        console.log("Store set");

        this.replicant.value = value;
    }

    update(updater: (value: T) => T): void {
        console.log("Store update");

        this.replicant.value = updater(this.replicant.value);
    }
}
