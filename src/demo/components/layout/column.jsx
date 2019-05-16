import React from "react";
import "./styles.css";
import { combineClassnames } from "../../util";

export const Column = props => (
  <div
    {...props}
    className={combineClassnames("flex-column", props.className)}
  />
);
