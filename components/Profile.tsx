import Image from "next/image";
import RichText from "./RichText";
import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";
import { Badge } from "./ui/badge";
import Link from "next/link";

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
            <Badge asChild variant="secondary" className="mt-2">
              <Link href={cv.general.website}>
                {String(cv.general.website).split("https://").at(1)}
              </Link>
            </Badge>
          ) : null}
        </div>
      </div>

      {cv.general.about ? (
        <section className={`my-8 md:my-16`}>
          <h3 className="mb-2">About</h3>
          <div className="mt-2 text-muted-foreground gap-4 flex flex-col ml-4 md:ml-0">
            <RichText text={cv.general.about} />
          </div>
        </section>
      ) : null}

      {cv.allCollections.map((collection: any, index: number) => {
        return (
          <section className="my-12 md:my-16" key={index}>
            <h3 className="mb-2">{collection.name}</h3>
            <div
              className={
                collection.name === "Contact"
                  ? "flex flex-col gap-4 md:gap-4 mt-6"
                  : "flex flex-col gap-9 mt-6"
              }
            >
              {collection.items.map((experience: any, index: number) => {
                if (collection.name === "Contact") {
                  return (
                    <ContactItem key={experience.url} experience={experience} />
                  );
                }

                return (
                  <ProfileItem
                    key={experience.heading}
                    experience={experience}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

type ProfileItemProps = {
  experience: any;
};
const ProfileItem: React.FC<ProfileItemProps> = ({ experience }) => {
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
    <div className="flex flex-col md:flex-row gap-2 md:gap-9 ml-4 md:ml-0">
      <div className="text-muted-foreground tabular-nums relative shrink-0 min-w-24">
        {experience.year}
      </div>
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
        {experience.attachments && experience.attachments.length > 0 ? (
          <Attachments attachments={experience.attachments} />
        ) : null}
      </div>
    </div>
  );
};

type ContactItemProps = {
  experience: any;
};
const ContactItem: React.FC<ContactItemProps> = ({ experience }) => {
  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-9 ml-4 md:ml-0">
      <div className="text-muted-foreground tabular-nums relative min-w-24 w-fit">
        {experience.platform}
      </div>
      <div>
        <div className="flex items-center gap-1 text-primary [&>a]:hover:border-b-primary [&>a]:border-b [&>a]:border-b-transparent [&>a]:transition-colors">
          <a href={experience.url} target="_blank">
            {experience.handle}
          </a>
          <span className="whitespace-nowrap">
            <Arrow12 />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
