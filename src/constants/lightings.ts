export const lightings = [
    {
        id: 1,
        value: "none",
        label: "None",
    },
    {
        id: 2,
        value: "Back",
        label: "Back",
    },
    {
        id: 3,
        value: "Front",
        label: "Front",
    },
    {
        id: 4,
        value: "Side",
        label: "Side",
    },
    {
        id: 5,
        value: "Ambient",
        label: "Ambient",
    },
    {
        id: 6,
        value: "Spotlighting",
        label: "Spotlighting",
    },
    {
        id: 7,
        value: "Soft",
        label: "Soft",
    },
    {
        id: 8,
        value: "Dramatic",
        label: "Dramatic",
    },
    {
        id: 9,
        value: "Low Key",
        label: "Low Key",
    },
    {
        id: 10,
        value: "High Key",
        label: "High Key",
    },
    {
        id: 11,
        value: "Cinematic",
        label: "Cinematic",
    },
    {
        id: 12,
        value: "Golden Hour",
        label: "Golden Hour",
    },
    {
        id: 13,
        value: "Rembrandt",
        label: "Rembrandt",
    },
    {
        id: 14,
        value: "Broad",
        label: "Broad",
    },
    {
        id: 15,
        value: "Split",
        label: "Split",
    },
    {
        id: 16,
        value: "Butterfly",
        label: "Butterfly",
    },
    {
        id: 17,
        value: "Silhouette",
        label: "Silhouette",
    },
    {
        id: 18,
        value: "Chiaroscuro",
        label: "Chiaroscuro",
    },
    {
        id: 19,
        value: "Harsh",
        label: "Harsh",
    },
    {
        id: 20,
        value: "Softbox",
        label: "Softbox",
    },
];

export const getLightingFromLabel = (label: string): string => {
    return label === "None" ? "" : label.toLowerCase().replace(/\s+/g, '_');
}