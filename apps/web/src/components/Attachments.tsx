import { useRef, useState, useCallback } from "react";
import Scrollbar from "./Scrollbar";
import Lightbox from "./Lightbox";
import { AnimatePresence } from "framer-motion";
import { useScrollBoost } from "react-scrollbooster";
import isMobile from "~/lib/isMobile";
import useResizeObserver from "use-resize-observer";

type AttachmentsProps = {
  attachments: Array<any>;
};
const Attachments: React.FC<AttachmentsProps> = ({ attachments }) => {
  const [lightboxState, setLightboxState] = useState({
    open: false,
    startingIndex: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, scrollbooster] = useScrollBoost({
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

  const setRefs = useCallback<React.RefCallback<HTMLDivElement>>(
    (node) => {
      containerRef.current = node;
      viewport(node);
      onResize();
    },
    [viewport]
  );

  const updateScrollbooster = () => {
    if (!scrollbooster || !containerRef.current) {
      return;
    }
    scrollbooster.updateMetrics();
  };

  const onResize = () => {
    updateScrollbooster();
  };

  useResizeObserver({ ref: containerRef as any, onResize });
  useResizeObserver({ ref: innerRef as any, onResize });

  let lightbox;
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

  let item;
  if (media.type === "image") {
    item = (
      <img
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
    <div
      style={{
        aspectRatio: returnThumbnailAspectRatio(media.width / media.height),
      }}
      onClick={onClick}
      className="cursor-pointer w-full h-full z-10 rounded-md overflow-hidden shadow"
    >
      {item}
    </div>
  );
};

export default Attachments;
