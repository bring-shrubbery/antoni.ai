import profileData from "../../content/profileData.json";

export const loadCV = async () => {
  const cv: any = profileData;
  cv.allCV = [
    cv.contact,
    cv.workExperience,
    cv.education,
    cv.volunteering,
    cv.certifications,
  ];
  cv.allProjects = [cv.projects];
  cv.allDesign = [cv.design];
  return cv;
};
