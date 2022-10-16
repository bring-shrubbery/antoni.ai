import type { Component } from "solid-js";

import infoIcon from "../assets/info-icon.svg";
import closeIcon from "../assets/close-icon.svg";

export const CardInfoButton: Component<{ clicked: () => boolean }> = ({
  clicked,
}) => {
  return (
    <img
      class=""
      src={clicked() ? closeIcon : infoIcon}
      alt={clicked() ? "Close" : "Info"}
      width={clicked() ? 24 : 20}
      height={clicked() ? 24 : 20}
    />
  );
};
