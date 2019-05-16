import React from "react";
import "./styles.css";

import { Row, Column } from "../";

export const SideBySide = props => (
  <Row>
    {props.children.map(child => (
      <Column key={child.key} className="extra-padding">
        {child}
      </Column>
    ))}
  </Row>
);
