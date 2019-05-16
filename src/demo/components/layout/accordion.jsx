import React from "react";
import { useToggle } from "../../hooks";
import { Column } from "./column";
import { Row } from "./row";
import { combineClassnames } from "../../util";

export const Accordion = props => {
  const { on, toggle } = useToggle(true);
  const { titleBar, content } = props.children;

  const toggledClassnames = on ? "border-bottom" : "";
  return (
    <Column className="border margin">
      <Row
        onClick={toggle}
        className={combineClassnames("title-bar padding", toggledClassnames)}
      >
        {titleBar}
      </Row>
      {on && <Row className="padding">{content}</Row>}
    </Column>
  );
};
