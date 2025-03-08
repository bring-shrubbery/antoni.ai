import { promises as fs } from "fs";

export const loadCV = async () => {
  const file = await fs.readFile(
    process.cwd() + "/public/content/profileData.json",
    "utf8"
  );
  const cv = JSON.parse(file);
  return cv;
};
