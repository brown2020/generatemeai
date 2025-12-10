import { createLabelToValueMapper } from "./optionFactory";

export const compositions = [
  { value: "none", label: "None" },
  { value: "rule_of_thirds", label: "Rule of Thirds" },
  { value: "symmetrical", label: "Symmetrical" },
  { value: "centered", label: "Centered" },
  { value: "diagonal", label: "Diagonal" },
  { value: "golden_ratio", label: "Golden Ratio" },
  { value: "dynamic", label: "Dynamic" },
];

export const getCompositionFromLabel = createLabelToValueMapper();
