import type { Component } from "solid-js";
import type { CTALinkType } from "./CTALink";
import { CTALink } from "./CTALink";
import type { CTAShellType } from "./CTAShell";
import { CTAShell } from "./CTAShell";

interface Props {
  cta: CTALinkType | CTAShellType;
}

export const CTA: Component<Props> = ({ cta }) => {
  return (
    <>{cta.type == "link" ? <CTALink data={cta} /> : <CTAShell data={cta} />}</>
  );
};
