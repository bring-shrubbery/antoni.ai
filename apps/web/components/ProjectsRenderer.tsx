"use client";

import Link from "next/link";
import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";
import RichText from "./RichText";
import { AnimatePresence, motion } from "framer-motion";

export const ProjectsRenderer = ({ items }: { items: any[] }) => {
  return (
    <motion.section className={`my-12 first:my-4 motion-preset-fade`} layout>
      <motion.div className={"flex flex-col gap-12 md:gap-24 mt-6"} layout>
        <AnimatePresence initial={false}>
          {items.map((experience: any) => {
            const key = experience.id ?? experience.slug ?? experience.heading;
            return (
              <motion.div
                key={key}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.7,
                }}
              >
                <ProjectItem experience={experience} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
};

type ProjectItemProps = {
  experience: any;
};
const ProjectItem: React.FC<ProjectItemProps> = ({ experience }) => {
  let title: React.ReactNode;

  if (experience.url) {
    title = (
      <>
        <Link href={experience.url} target="_blank">
          {experience.heading}
        </Link>
        <span className="whitespace-nowrap">
          <Arrow12 />
        </span>
      </>
    );
  } else {
    title = experience.heading;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="-mx-4">
        {experience.attachments && experience.attachments.length > 0 ? (
          <Attachments attachments={experience.attachments} />
        ) : null}
      </div>
      <div className="">
        <div className="w-full space-y-1">
          <div className="text-muted-foreground">{experience.year ?? ""}</div>
          <div className="flex items-center gap-1 text-primary [&>a]:hover:border-b-primary [&>a]:border-b [&>a]:border-b-transparent [&>a]:transition-colors text-lg">
            {title}
          </div>
        </div>
        {experience.location ? (
          <div className="text-muted-foreground">{experience.location}</div>
        ) : null}
        {experience.description ? (
          <div className={"mt-2 text-muted-foreground gap-4 flex flex-col"}>
            <RichText text={experience.description} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
