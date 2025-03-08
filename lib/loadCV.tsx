import { promises as fs } from "fs";

export const loadCV = async () => {
  const file = await fs.readFile(
    process.cwd() + "/public/content/profileData.json",
    "utf8"
  );
  const cv = JSON.parse(file);
  cv.allCV = [
    cv.contact,
    cv.workExperience,
    cv.education,
    cv.volunteering,
    cv.certifications,
  ];
  cv.allProjects = [cv.projects, cv.sideProjects];
  return cv;
};
