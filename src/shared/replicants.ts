// Dummy replicant for typing
import {ReplicantStore} from "./replicantstore";
import {VETOS_PER_PLAYER} from "./constants";

export class Replicant<T> {
    value: T;
    status: string;
    on(_event: string, _callback: (newValue: T, oldValue?: T) => void) {}
}

export class Replicants {
    runner1: Replicant<any>;
    runner2: Replicant<any>;
    commentators: Replicant<string[]>;

    player1Vetos: Replicant<any[]>;
    player2Vetos: Replicant<any[]>;
    usedMaps: Replicant<any[]>;
    currentMap: Replicant<any>;

    ghostClients: Replicant<any[]>;
    times: Replicant<any>;
    attempts: Replicant<any>;
    streamDelay: Replicant<number>;

    score1: Replicant<number>;
    score2: Replicant<number>;
    timerDuration: Replicant<any>;

    runData: Replicant<any>;
    timer: Replicant<any>;

    constructor(nodecg: any) {
        this.runner1 = nodecg.Replicant("runner1", { defaultValue: {}, persistent: false });
        this.runner2 = nodecg.Replicant("runner2", { defaultValue: {}, persistent: false });
        this.commentators = nodecg.Replicant("commentators", { defaultValue: [], persistent: false });

        this.player1Vetos = nodecg.Replicant("player1Vetos", { defaultValue: Array(VETOS_PER_PLAYER), persistent: false });
        this.player2Vetos = nodecg.Replicant("player2Vetos", { defaultValue: Array(VETOS_PER_PLAYER), persistent: false });
        this.usedMaps = nodecg.Replicant("usedMaps", { defaultValue: [], persistent: false });
        this.currentMap = nodecg.Replicant("currentMap", { defaultValue: undefined, persistent: false });

        this.ghostClients = nodecg.Replicant("ghostClients", { defaultValue: [], persistent: false });
        this.times = nodecg.Replicant("times", { defaultValue: {}, persistent: false });
        this.attempts = nodecg.Replicant("attempts", { defaultValue: {}, persistent: false });
        this.streamDelay = nodecg.Replicant("streamDelay", { defaultValue: 5, persistent: false });

        this.score1 = nodecg.Replicant("runner-score1", "p2cml");
        this.score2 = nodecg.Replicant("runner-score2", "p2cml");
        this.timerDuration = nodecg.Replicant("timer-duration", "p2cml");

        this.runData = nodecg.Replicant("runDataActiveRun", "nodecg-speedcontrol");
        this.timer = nodecg.Replicant("timer", "nodecg-speedcontrol");
    }
}

export class ReplicantStores {
    runner1: ReplicantStore<any>;
    runner2: ReplicantStore<any>;
    commentators: ReplicantStore<string[]>;

    player1Vetos: ReplicantStore<any[]>;
    player2Vetos: ReplicantStore<any[]>;
    usedMaps: ReplicantStore<any[]>;
    currentMap: ReplicantStore<any>;

    ghostClients: ReplicantStore<any[]>;
    times: ReplicantStore<any>;
    attempts: ReplicantStore<any>;
    streamDelay: ReplicantStore<number>;

    score1: ReplicantStore<number>;
    score2: ReplicantStore<number>;
    timerDuration: ReplicantStore<any>;

    runData: ReplicantStore<any>;
    timer: ReplicantStore<any>;

    constructor(replicants: Replicants) {
        this.runner1 = new ReplicantStore<any>(replicants.runner1);
        this.runner2 = new ReplicantStore<any>(replicants.runner2);
        this.commentators = new ReplicantStore<string[]>(replicants.commentators);

        this.player1Vetos = new ReplicantStore<any[]>(replicants.player1Vetos);
        this.player2Vetos = new ReplicantStore<any[]>(replicants.player2Vetos);
        this.usedMaps = new ReplicantStore<any[]>(replicants.usedMaps);
        this.currentMap = new ReplicantStore<any>(replicants.currentMap);

        this.ghostClients = new ReplicantStore<any[]>(replicants.ghostClients);
        this.times = new ReplicantStore<any>(replicants.times);
        this.attempts = new ReplicantStore<any>(replicants.attempts);
        this.streamDelay = new ReplicantStore<number>(replicants.streamDelay);

        this.score1 = new ReplicantStore<number>(replicants.score1);
        this.score2 = new ReplicantStore<number>(replicants.score2);
        this.timerDuration = new ReplicantStore<number>(replicants.timerDuration);

        this.runData = new ReplicantStore<any>(replicants.runData);
        this.timer = new ReplicantStore<any>(replicants.timer);
    }
}

let replicantsSingleton: Replicants | undefined;
let replicantStoresSingleton: ReplicantStores | undefined;

export function replicants(nodecg: any): Replicants {
    if (!replicantsSingleton) {
        replicantsSingleton = new Replicants(nodecg);
    }
    return replicantsSingleton;
}

export function replicantStores(nodecg: any): ReplicantStores {
    if (!replicantStoresSingleton) {
        replicantStoresSingleton = new ReplicantStores(replicants(nodecg));
    }
    return replicantStoresSingleton;
}
