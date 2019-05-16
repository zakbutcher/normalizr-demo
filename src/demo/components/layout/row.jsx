import React from "react";
import "./styles.css";
import { combineClassnames } from "../../util";

export const Row = props => (
  <div {...props} className={combineClassnames("flex-row", props.className)} />
);
