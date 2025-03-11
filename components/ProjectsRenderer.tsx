import Link from "next/link";
import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";
import RichText from "./RichText";

export const ProjectsRenderer = ({ items }: { items: any[] }) => {
  return (
    <>
      {items.map((collection: any, index: number) => {
        return (
          <section
            className={`my-16 first:my-4 motion-preset-slide-up-sm`}
            key={index}
          >
            <div className={"flex flex-col gap-24 mt-6"}>
              {collection.items.map((experience: any, index: number) => {
                return (
                  <ProjectItem
                    key={experience.heading}
                    experience={experience}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
};

type ProjectItemProps = {
  experience: any;
};
const ProjectItem: React.FC<ProjectItemProps> = ({ experience }) => {
  let title;

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
    <div className="flex flex-col gap-2 md:gap-5 ml-4 md:ml-0">
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
