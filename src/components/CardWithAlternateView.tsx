import type { CTALinkType } from "./CTALink";
import type { CTAShellType } from "./CTAShell";
import { CTA } from "./CTA";

import { CardInfoButton } from "./CardInfoButton";
import { children, createSignal, ParentComponent } from "solid-js";
import { Icon, IconType } from "./Icon";

export interface CardInfo {
  title: string;
  description: string;
  icon?: IconType;
  cta: CTALinkType | CTAShellType;
}

export type CardSize = "small" | "medium" | "large" | "full";

export interface Props {
  primary?: CardInfo;
  info?: CardInfo;
  size?: CardSize;
  rotateZdeg?: number;
}

const CARD_SIZE_CLASSES: Record<CardSize, string> = {
  small: "w-[100px] h-[170px]",
  medium: "w-[280px] h-[170px]",
  large: "w-[460px] min-h-[170px]",
  full: "w-[600px] min-h-[170px]",
};

const Card: ParentComponent<Props> = (props) => {
  const { primary, info, rotateZdeg = 0, size = "medium" } = props;

  const c = children(() => props.children);
  const [clicked, setClicked] = createSignal(false);
  const toggle = () => {
    setClicked(!clicked());
  };

  // TODO: Do hover parallax effect.
  // const [x, sx] = createSignal<number>();
  // const [y, sy] = createSignal<number>();

  return (
    <div
      class={`relative overflow-hidden ${CARD_SIZE_CLASSES[size]} shadow-default mx-auto`}
      style={{
        transform: `rotate3d(0, 0, 1, ${rotateZdeg}deg)`,
      }}
    >
      <div
        class={`py-5 absolute inset-0 bg-primary ${
          size !== "small" ? "pl-7 pr-5" : "pl-3 pr-3"
        }`}
      >
        {primary ? (
          <>
            <div class="w-full flex gap-3 items-center">
              {primary.icon && <Icon icon={primary.icon} />}
              <h3 class="text-xl font-bold">{primary.title}</h3>
            </div>
            <p class="mt-2 mb-3 leading-tight tracking-wide">
              {primary.description}
            </p>
            <CTA cta={primary.cta} />
          </>
        ) : (
          c()
        )}
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
            <div class="w-full flex gap-3 items-center">
              {info.icon && <Icon icon={info.icon} />}
              <h3 class="text-xl font-bold">{info.title}</h3>
            </div>
            <p class="mt-2 mb-3 leading-tight tracking-wide">
              {info.description}
            </p>
            <CTA cta={info.cta} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
