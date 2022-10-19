import type { Component } from "solid-js";
import { Icon } from "./Icon";

export const CardInfoButton: Component<{ clicked: () => boolean }> = (
  props
) => {
  if (props.clicked()) {
    return <Icon icon="close" w={24} h={24} />;
  } else {
    return <Icon icon="info" w={20} h={20} />;
  }
};
