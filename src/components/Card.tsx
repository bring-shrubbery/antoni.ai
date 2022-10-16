import type { CTALinkType } from "./CTALink";
import type { CTAShellType } from "./CTAShell";
// import ResumeIcon from "./ResumeIcon.astro";
import { CTA } from "./CTA";

import { CardInfoButton } from "./CardInfoButton";
import { Component, createEffect, createSignal, Ref } from "solid-js";

export interface CardInfo {
  title: string;
  description: string;
  icon?: Element;
  cta: CTALinkType | CTAShellType;
}

export interface Props {
  primary: CardInfo;
  info?: CardInfo;
}

interface Coordinates {
  x: number;
  y: number;
}

const Card: Component<Props> = ({ primary, info }) => {
  const [clicked, setClicked] = createSignal(false);
  const toggle = () => {
    setClicked(!clicked());
  };

  return (
    <li class="w-[280px] h-[170px] shadow-default relative overflow-hidden">
      <div class="pl-7 pr-5 py-5 absolute inset-0 bg-primary">
        <div class="w-full flex gap-4 items-center">
          {primary.icon}
          <h2 class="text-xl font-bold">{primary.title}</h2>
        </div>
        <p class="mt-2 mb-3 leading-tight tracking-wide">
          {primary.description}
        </p>
        <CTA cta={primary.cta} />
      </div>
      {info && (
        <div
          class={`absolute inset-0 bg-alternate  ${
            clicked() ? "info-clicked" : "info-btn"
          }`}
          style={{
            transition: "clip-path ease-in-out 0.25s",
            "clip-path": clicked()
              ? "circle(700px at 260px 20px)"
              : "circle(28px at 260px 20px)",
          }}
        >
          <span
            class={`absolute w-16 h-16 -top-3 -right-3 rounded-full cursor-pointer z-50 transition-colors delay-200 flex items-center justify-center`}
            onClick={toggle}
          >
            <CardInfoButton clicked={clicked} />
          </span>
          <div class="relative w-full h-full pl-7 pr-5 py-5">
            <div class="w-full flex gap-4 items-center">
              {info.icon}
              <h2 class="text-xl font-bold">{info.title}</h2>
            </div>
            <p class="mt-2 mb-3 leading-tight tracking-wide">
              {info.description}
            </p>
            <CTA cta={info.cta} />
          </div>
        </div>
      )}
    </li>
  );
};

export default Card;
