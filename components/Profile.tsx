"use client";

import Image from "next/image";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CVRenderer } from "./CVRenderer";
import { ProjectsRenderer } from "./ProjectsRenderer";
import { DarkModeToggleLazy } from "./dark-mode-toggle-lazy";
import { useState } from "react";
import { StarIcon, StarOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = ({ cv, tab }: { cv: any; tab?: string }) => {
  const [tabState, setTabState] = useState(tab ?? "cv");
  const [isFav, setIsFav] = useState(false);

  const filteredProjects = cv.allProjects
    .at(0)
    .items.filter((item: any) => (isFav ? item.fav : true));

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
            <div className="flex flex-wrap gap-2">
              {cv.general.websites
                ? cv.general.websites.map((w: any, i: number) => (
                    <Link href={w.url} key={w.id}>
                      <Badge variant="outline" className="mt-2">
                        {w.label}
                      </Badge>
                    </Link>
                  ))
                : null}
            </div>
          </div>
          <DarkModeToggleLazy />
        </div>
      </div>

      <Tabs
        defaultValue={tab ?? "cv"}
        value={tabState}
        onValueChange={setTabState}
        className="my-2"
      >
        <TabsList className="mt-4 w-full">
          <TabsTrigger value="cv" className="flex-[1]">
            CV
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-[0.9]">
            <span
              className={cn(
                "pl-[42px] transition-all mx-auto w-fit",
                tabState === "projects" && "pl-0"
              )}
            >
              Projects
            </span>
          </TabsTrigger>
          <StarToggle
            hidden={tabState !== "projects"}
            checked={isFav}
            handleToggle={() => setIsFav((prev) => !prev)}
          />
          {/* <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="blog">Tech Blog</TabsTrigger> */}
        </TabsList>
        <TabsContent value="cv" className="my-0">
          <CVRenderer items={cv.allCV} about={cv.general.about} />
        </TabsContent>
        <TabsContent value="projects" className="my-0">
          <ProjectsRenderer items={filteredProjects} />
        </TabsContent>
        {/* <TabsContent value="design" className="my-0">
          <ProjectsRenderer items={cv.allDesign} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

const StarToggle = ({
  hidden,
  checked,
  handleToggle,
}: {
  hidden: boolean;
  checked: boolean;
  handleToggle: () => void;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "w-[26px] flex items-center justify-center text-muted ml-1 hover:bg-muted hover:text-orange-400 h-full rounded-sm transition-all duration-75",
        hidden && "opacity-0 pointer-events-none select-none",
        checked && "text-orange-400 bg-foreground/5"
      )}
      title="Show only my favourite projects"
      onClick={handleToggle}
    >
      {checked ? (
        <StarIcon className="size-4" />
      ) : (
        <StarOffIcon className="size-4" />
      )}
    </button>
  );
};

export default Profile;
