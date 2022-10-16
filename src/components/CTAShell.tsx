import type { Component } from "solid-js";

export interface CTAShellType {
  type: "shell";
  command: string;
}

interface Props {
  data: CTAShellType;
}

export const CTAShell: Component<Props> = ({ data }) => {
  return (
    <code class="block w-full px-5 py-1.5 bg-black shadow-default-6 font-mono text-white">
      <span class="select-none">{"> "}</span>
      <span>{data.command}</span>
    </code>
  );
};
