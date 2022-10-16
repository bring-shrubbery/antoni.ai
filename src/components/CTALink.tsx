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
      class="block w-fit px-5 py-1.5 font-bold bg-secondary transition-shadow shadow-default-6 hover:shadow-default-4 text-primary ml-auto"
    >
      {data.label}
    </a>
  );
};
