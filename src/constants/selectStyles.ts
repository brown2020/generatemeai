import { StylesConfig } from "react-select";
import { CSSObject } from "@emotion/react";

export const selectStyles: StylesConfig<
  { id: number; value: string; label: string },
  false
> = {
  option: (provided: CSSObject): CSSObject => ({
    ...provided,
    color: "black",
    backgroundColor: "#eeeeee",
    "&:hover": {
      backgroundColor: "#80bdff",
      color: "black",
    },
  }),
  control: (provided: CSSObject): CSSObject => ({
    ...provided,
    backgroundColor: "white",
    color: "black",
    border: "1px solid #ccc",
    borderRadius: "4px",
    "&:hover": {
      borderColor: "#80bdff",
      boxShadow: "none",
    },
  }),
  singleValue: (provided: CSSObject): CSSObject => ({
    ...provided,
    color: "black",
  }),
  input: (provided: CSSObject): CSSObject => ({
    ...provided,
    color: "black",
  }),
  placeholder: (provided: CSSObject): CSSObject => ({
    ...provided,
    color: "black",
  }),
  menu: (provided: CSSObject): CSSObject => ({
    ...provided,
    color: "black",
    backgroundColor: "#eeeeee",
  }),
};
