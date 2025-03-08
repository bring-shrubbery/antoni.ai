import Arrow12 from "./Arrow12";
import Attachments from "./Attachments";
import RichText from "./RichText";

export const CVRenderer = ({ items, about }: { items: any[]; about: any }) => {
  return (
    <>
      {about ? (
        <section className={`my-4 motion-preset-slide-up-sm`}>
          <h3 className="mb-2">About</h3>
          <div className="mt-2 text-muted-foreground gap-4 flex flex-col ml-4 md:ml-0">
            <RichText text={about} />
          </div>
        </section>
      ) : null}

      {items.map((collection: any, index: number) => {
        return (
          <section
            className="my-12 md:my-16 motion-preset-slide-up-sm delay-150"
            key={index}
          >
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
                    <ContactItem key={experience.id} experience={experience} />
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
    </>
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
