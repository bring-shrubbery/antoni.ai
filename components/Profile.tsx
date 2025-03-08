import Image from "next/image";
import RichText from "./RichText";
import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CVRenderer } from "./CVRenderer";

type ProfileProps = {
  cv: any;
};
const Profile: React.FC<ProfileProps> = ({ cv }) => {
  return (
    <div className="w-full max-w-[540px] mx-auto py-12">
      <div className="flex items-center gap-4">
        <div className="size-24 rounded-full shrink-0 overflow-hidden">
          <Image
            src={cv.general.profilePhoto}
            alt=""
            width={96}
            height={96}
            className="object-cover size-full"
          />
        </div>
        <div>
          <h1 className="text-xl">{cv.general.displayName}</h1>
          <div className="text-muted-foreground">{cv.general.byline}</div>
          {cv.general.website ? (
            <Link href={cv.general.website}>
              <Badge variant="secondary" className="mt-2">
                {String(cv.general.website).split("https://").at(1)}
              </Badge>
            </Link>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="cv" className="my-0">
        <TabsList className="mt-4 w-full">
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="my-0">
          <ProjectsRenderer items={cv.allProjects} />
        </TabsContent>
        <TabsContent value="cv" className="my-0">
          <CVRenderer items={cv.allCV} about={cv.general.about} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

const ProjectsRenderer = ({ items }: { items: any[] }) => {
  return (
    <>
      {items.map((collection: any, index: number) => {
        return (
          <section
            className={`my-16 first:my-4 motion-preset-slide-up-sm`}
            key={index}
          >
            <h3 className="mb-2">{collection.name}</h3>
            <div className={"flex flex-col gap-9 mt-6"}>
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
        <a href={experience.url} target="_blank">
          {experience.heading}
        </a>
        <span className="whitespace-nowrap">
          <Arrow12 />
        </span>
      </>
    );
  } else {
    title = experience.heading;
  }

  return (
    <div className="flex flex-col gap-2 md:gap-9 ml-4 md:ml-0">
      {experience.attachments && experience.attachments.length > 0 ? (
        <Attachments attachments={experience.attachments} />
      ) : null}
      <div>
        <div className="flex items-center gap-1 text-primary [&>a]:hover:border-b-primary [&>a]:border-b [&>a]:border-b-transparent [&>a]:transition-colors">
          {title}
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
