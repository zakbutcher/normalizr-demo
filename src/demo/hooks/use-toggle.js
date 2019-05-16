import { useState } from "react";

export const useToggle = (defaultOpen = false) => {
  const [on, setToggle] = useState(defaultOpen);
  const toggle = () => setToggle(!on);
  return {
    on,
    toggle
  };
};
