export const colors = [
    {
        id: 1,
        value: "none",
        label: "None",
    },
    {
        id: 2,
        value: "Nature",
        label: "Nature",
    },
    {
        id: 3,
        value: "Warm",
        label: "Warm",
    },
    {
        id: 4,
        value: "Cool",
        label: "Cool",
    },
    {
        id: 5,
        value: "Vibrant",
        label: "Vibrant",
    },
    {
        id: 6,
        value: "Pastel",
        label: "Pastel",
    },
    {
        id: 7,
        value: "Monochrome",
        label: "Monochrome",
    },
    {
        id: 8,
        value: "Earthy",
        label: "Earthy",
    },
    {
        id: 9,
        value: "Neon",
        label: "Neon",
    },
    {
        id: 10,
        value: "Muted",
        label: "Muted",
    },
    {
        id: 11,
        value: "Vintage",
        label: "Vintage",
    },
    {
        id: 12,
        value: "Sepia",
        label: "Sepia",
    },
    {
        id: 13,
        value: "Golden",
        label: "Golden",
    },
    {
        id: 14,
        value: "Jewel Tones",
        label: "Jewel Tones",
    },
    {
        id: 15,
        value: "High Contrast",
        label: "High Contrast",
    },
    {
        id: 16,
        value: "Soft",
        label: "Soft",
    },
];

export const getColorFromLabel = (label: string): string => {
    return label === "None" ? "" : label.toLowerCase().replace(/\s+/g, '_');
}
