import { htmlTemplate } from "./templates/root";

export const renderAdminPanel = (): string => {
  return htmlTemplate({
    title: "CMS Admin Panel",
    body: `
      <div id="cms-root"></div>
      <script src="/admin/static/bundle.js" type="module"></script>
    `,
  });
};
