import Image from "next/image";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CVRenderer } from "./CVRenderer";
import { ProjectsRenderer } from "./ProjectsRenderer";
import { DarkModeToggleLazy } from "./dark-mode-toggle-lazy";

type ProfileProps = {
  cv: any;
};
const Profile: React.FC<ProfileProps> = ({ cv }) => {
  return (
    <div className="w-full max-w-[540px] mx-auto py-12">
      <div className="flex items-center gap-6">
        <div className="size-24 rounded-full shrink-0 overflow-hidden">
          <Image
            src={cv.general.profilePhoto}
            alt=""
            width={96}
            height={96}
            className="object-cover size-full motion-preset-fade"
          />
        </div>
        <div className="flex w-full justify-between items-center">
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
          <DarkModeToggleLazy />
        </div>
      </div>

      <Tabs defaultValue="cv" className="my-2">
        <TabsList className="mt-4 w-full">
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          {/* <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="blog">Tech Blog</TabsTrigger> */}
        </TabsList>
        <TabsContent value="cv" className="my-0">
          <CVRenderer items={cv.allCV} about={cv.general.about} />
        </TabsContent>
        <TabsContent value="projects" className="my-0">
          <ProjectsRenderer items={cv.allProjects} />
        </TabsContent>
        {/* <TabsContent value="design" className="my-0">
          <ProjectsRenderer items={cv.allDesign} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default Profile;
