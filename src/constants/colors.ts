export const colors = [
    {
        id: 1,
        value: "None",
        label: "None",
    },
    {
        id: 2,
        value: "Warm",
        label: "Warm",
    },
    {
        id: 3,
        value: "Cool",
        label: "Cool",
    },
    {
        id: 4,
        value: "Vibrant",
        label: "Vibrant",
    },
    {
        id: 5,
        value: "Pastel",
        label: "Pastel",
    },
    {
        id: 6,
        value: "Monochrome",
        label: "Monochrome",
    },
    {
        id: 7,
        value: "Earthy",
        label: "Earthy",
    },
    {
        id: 8,
        value: "Neon",
        label: "Neon",
    },
    {
        id: 9,
        value: "Muted",
        label: "Muted",
    },
    {
        id: 10,
        value: "Vintage",
        label: "Vintage",
    },
    {
        id: 11,
        value: "Sepia",
        label: "Sepia",
    },
    {
        id: 12,
        value: "Golden",
        label: "Golden",
    },
    {
        id: 13,
        value: "Jewel Tones",
        label: "Jewel Tones",
    },
    {
        id: 14,
        value: "High Contrast",
        label: "High Contrast",
    },
    {
        id: 15,
        value: "Soft",
        label: "Soft",
    },
];

export const getColorFromLabel = (label: string) => {
    const color = colors.find(color => color.label === label);
    return color ? color.value : null;
}