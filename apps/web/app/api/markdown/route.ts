export const GET = async (req: Request): Promise<Response> => {
  const profileData = await fetch(
    process.env.APP_HOST + "/content/profileData.json",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 1 hour cache
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
  const profile = await profileData.json();

  return new Response(renderToString(profile), {
    headers: {
      // File encoding format to support empjis:
      "Content-Type": "text/markdown; charset=utf-8",
      // 1 hour cache
      "Cache-Control": "public, max-age=3600",
    },
  });
};

const renderToString = (profile: any) => {
  return [
    toMdGeneralSection(profile.general),
    toMdContactSection(profile.contact),
    toMdExperienceSection(profile.workExperience),
    toMdEducationSection(profile.education),
    toMdProjectsSection(profile.projects),
    toMdVolunteeringSection(profile.volunteering),
    toMdCertificationsSection(profile.certifications),
  ].join("\n\n");
};

const toMdGeneralSection = (general: any) => {
  return `# ${general.displayName}
> ${general.byline}
> [${general.website}](${general.websiteURL})

## About

${general.about.replaceAll("\\\n\\", "\n")}`;
};

const toMdContactSection = (contact: any) => {
  return `## Contact

${contact.items
  .map(
    (c: any) =>
      `- ${c.platform}${new Array(Math.max(0, 8 - c.platform.length))
        .fill(" ")
        .join("")} [${c.handle}](${c.url})`
  )
  .join("\n")}`;
};

const toMdExperienceSection = (experience: any) => {
  return `## Work Experience

${experience.items
  .map(
    (e: any) =>
      `### ${e.heading} (${e.year})
> 📍 ${e.location}

${e.description.replaceAll("\\\n\\", "\n")}}`
  )
  .join("\n\n")}`;
};

const toMdEducationSection = (education: any) => {
  return `## Education

${education.items
  .map(
    (e: any) =>
      `### ${e.heading} (${e.year})
> 📍 ${e.location}

${e.description.replaceAll("\\\n\\", "\n")}}`
  )
  .join("\n\n")}`;
};

const toMdProjectsSection = (projects: any) => {
  return `## Projects

${projects.items
  .map(
    (e: any) =>
      `### ${e.heading} (${e.year})
> [${e.url.replace(/https?:\/\//, "")}](${e.url})

${e.description.replaceAll("\\\n\\", "\n")}}

![${e.heading} preview](${e.attachments.at(0)?.url})`
  )
  .join("\n\n")}`;
};

const toMdVolunteeringSection = (volunteering: any) => {
  return `## Volunteering

${volunteering.items
  .map(
    (e: any) =>
      `### ${e.heading} (${e.year})
> 📍 ${e.location}

${e.description.replaceAll("\\\n\\", "\n")}}`
  )
  .join("\n\n")}`;
};

const toMdCertificationsSection = (certifications: any) => {
  return `## Certifications

${certifications.items
  .map(
    (e: any) =>
      `### ${e.heading} (${e.year})
> [Certification URL](${e.url})
${e.description.replaceAll("\\\n\\", "\n")}}`
  )
  .join("\n\n")}`;
};
