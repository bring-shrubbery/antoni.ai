"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Scrollbar from "./Scrollbar";
import Lightbox from "./Lightbox";
import { AnimatePresence } from "framer-motion";
import { useScrollBoost } from "react-scrollbooster";
import isMobile from "@/lib/isMobile";
import useResizeObserver from "use-resize-observer";

const Attachments = ({ attachments }: { attachments: Array<any> }) => {
  const [lightboxState, setLightboxState] = useState({
    open: false,
    startingIndex: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, scrollBooster] = useScrollBoost({
    direction: "horizontal",
    friction: 0.05,
    scrollMode: "native",
    textSelection: false,
    onUpdate: (data) => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = data.position.x;
      }
    },
    shouldScroll: () => {
      return !isMobile();
    },
  });

  const updateScrollBooster = useCallback(() => {
    if (!scrollBooster || !containerRef.current) {
      return;
    }
    scrollBooster.updateMetrics();
  }, [scrollBooster]);

  const onResize = useCallback(() => {
    updateScrollBooster();
  }, [updateScrollBooster]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resize in deps causes infinite loop
  const setRefs = useCallback<React.RefCallback<HTMLDivElement>>(
    (node) => {
      containerRef.current = node;
      viewport(node);
      onResize();
    },
    [viewport]
  );

  useResizeObserver({ ref: containerRef as any, onResize });
  useResizeObserver({ ref: innerRef as any, onResize });

  let lightbox: React.ReactNode = null;
  if (lightboxState.open === true) {
    lightbox = (
      <Lightbox
        attachments={attachments}
        startingIndex={lightboxState.startingIndex}
        close={() =>
          setLightboxState({
            open: false,
            startingIndex: 0,
          })
        }
      />
    );
  }

  return (
    <>
      <div className="w-full flex">
        <div ref={setRefs} className="w-full">
          <div ref={innerRef} className="w-full flex">
            {attachments.map((media, index) => {
              return (
                <Attachment
                  key={media.url}
                  onClick={() =>
                    setLightboxState({
                      open: true,
                      startingIndex: index,
                    })
                  }
                  media={media}
                />
              );
            })}
          </div>
        </div>
      </div>
      <Scrollbar
        scrollview={containerRef}
        innerChild={scrollRef}
        inlineStyle={{ marginTop: 8 }}
      />
      <AnimatePresence>{lightbox}</AnimatePresence>
    </>
  );
};

type AttachmentProps = {
  media: any;
  onClick: () => void;
};
const Attachment: React.FC<AttachmentProps> = ({ media, onClick }) => {
  const maxWidth = 21 / 9; // ultrawide monitor
  const minWidth = 19 / 5 / 9; // iPhone

  const returnThumbnailAspectRatio = (ratio: number) => {
    if (ratio < minWidth) {
      return minWidth;
    } else if (ratio > maxWidth) {
      return maxWidth;
    } else {
      return ratio;
    }
  };

  let item: React.ReactNode = null;
  if (media.type === "image") {
    item = (
      <Image
        alt=""
        src={media.url}
        height={400}
        width={800}
        className="object-cover w-full h-full shadow-lg"
      />
    );
  } else if (media.type === "video") {
    item = <video src={media.url} autoPlay loop muted playsInline />;
  }

  return (
    <button
      type="button"
      style={{
        aspectRatio: returnThumbnailAspectRatio(media.width / media.height),
      }}
      onClick={onClick}
      className="cursor-pointer w-full h-full z-10 rounded-md overflow-hidden shadow"
    >
      {item}
    </button>
  );
};

export default Attachments;
