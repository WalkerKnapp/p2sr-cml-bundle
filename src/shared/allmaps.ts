export const maps = [
    {
        name: "Container Ride",
        mapFile: "sp_a1_intro1",
        chapter: 1,
        iverbId: 62761
    },
    {
        name: "Portal Carousel",
        mapFile: "sp_a1_intro2",
        chapter: 1,
        iverbId: 62758
    },
    {
        name: "Portal Gun",
        mapFile: "sp_a1_intro3",
        chapter: 1,
        iverbId: 47458
    },
    {
        name: "Smooth Jazz",
        mapFile: "sp_a1_intro4",
        chapter: 1,
        iverbId: 47455
    },
    {
        name: "Cube Momentum",
        mapFile: "sp_a1_intro5",
        chapter: 1,
        iverbId: 47452
    },
    {
        name: "Future Starter",
        mapFile: "sp_a1_intro6",
        chapter: 1,
        iverbId: 47106
    },
    {
        name: "Secret Panel",
        mapFile: "sp_a1_intro7",
        chapter: 1,
        iverbId: 62763
    },
    {
        name: "Wakeup",
        mapFile: "sp_a1_wakeup",
        chapter: 1,
        iverbId: 62759
    },
    {
        name: "Incinerator",
        mapFile: "sp_a2_intro",
        chapter: 1,
        iverbId: 47735
    }
];

export const globalBannedMaps = [
    "Container Ride",
    "Portal Carousel",
    "Secret Panel",
    "Wakeup",
    "Incinerator",
    "Column Blocker",
    "Neurotoxin Sabotage",
    "Core",
    "Underground",
    "Crazy Box",
    "Test",
    "Stop The Box",
    "Finale 1",
    "Finale 2",
    "Finale 3",
    "Finale 4"
];

export const globalAllowedMaps = maps.filter(m => !globalBannedMaps.includes(m.name));
