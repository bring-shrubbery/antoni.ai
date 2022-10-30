import type { Component } from "solid-js";

export interface CTALinkType {
  type: "link";
  label: string;
  href: string;
}

interface Props {
  data: CTALinkType;
}

export const CTALink: Component<Props> = ({ data }) => {
  return (
    <a
      href={data.href}
      target="_blank"
      rel="noopener noreferrer"
      class="block w-fit px-5 py-1.5 font-bold bg-secondary transition-all shadow-default-4 hover:shadow-default-6 text-primary ml-auto"
    >
      {data.label}
    </a>
  );
};
