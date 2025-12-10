/**
 * Shared factory utilities for option constants.
 * Used by colors, lightings, perspectives, compositions, mediums, moods, etc.
 */

export interface Option {
  value: string;
  label: string;
}

export interface OptionWithId extends Option {
  id: number;
}

/**
 * Creates a function that converts a label to a normalized value.
 * Returns empty string for "None", otherwise returns lowercase with spaces replaced by underscores.
 */
export const createLabelToValueMapper =
  () =>
  (label: string): string => {
    return label === "None" ? "" : label.toLowerCase().replace(/\s+/g, "_");
  };

/**
 * Creates an option finder function for a given options array.
 */
export const createOptionFinder = <T extends Option>(options: T[]) => {
  return (searchValue: string): T | undefined => {
    return options.find((option) => option.value === searchValue);
  };
};

/**
 * Creates an option finder by label for a given options array.
 */
export const createOptionFinderByLabel = <T extends Option>(options: T[]) => {
  return (searchLabel: string): T | undefined => {
    return options.find(
      (option) => option.label.toLowerCase() === searchLabel.toLowerCase()
    );
  };
};

/**
 * Adds sequential IDs to an array of options.
 */
export const withIds = <T extends Option>(
  options: T[]
): (T & { id: number })[] => {
  return options.map((option, index) => ({
    ...option,
    id: index + 1,
  }));
};

/**
 * Creates a complete option set with common utilities.
 */
export const createOptionSet = <T extends Option>(options: T[]) => {
  const optionsWithIds = withIds(options);

  return {
    options: optionsWithIds,
    getValueFromLabel: createLabelToValueMapper(),
    findByValue: createOptionFinder(optionsWithIds),
    findByLabel: createOptionFinderByLabel(optionsWithIds),
  };
};
