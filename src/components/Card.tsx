import type { CTALinkType } from "./CTALink";
import type { CTAShellType } from "./CTAShell";
import { CTA } from "./CTA";

import type { Component } from "solid-js";
import { Icon, IconType } from "./Icon";

export interface CardInfo {
  title: string;
  description: string;
  icon?: IconType;
  cta: CTALinkType | CTAShellType;
}

export type CardSize = "medium" | "2mid" | "lg" | "xl" | "full";

export interface Props {
  primary: CardInfo;
  size?: CardSize;
}

const CARD_SIZE_CLASSES: Record<CardSize, string> = {
  medium: "w-[280px] min-h-[170px]",
  "2mid": "w-[320px] min-h-[170px]",
  lg: "w-[400px] min-h-[170px]",
  xl: "w-[460px] min-h-[170px]",
  full: "w-[600px] min-h-[170px]",
};

const Card: Component<Props> = (props) => {
  const { primary, size = "medium" } = props;

  return (
    <div class={`${CARD_SIZE_CLASSES[size]} shadow-default mx-auto`}>
      <div class="py-6 px-6 bg-primary">
        <div class="w-full flex gap-3 items-center">
          {primary.icon && <Icon icon={primary.icon} />}
          <h3 class="text-xl font-bold">{primary.title}</h3>
        </div>
        <p class="mt-2 mb-3 leading-tight tracking-wide">
          {primary.description}
        </p>
        <CTA cta={primary.cta} />
      </div>
    </div>
  );
};

export default Card;
