import { htmlTemplate } from "../templates/root";

export const renderAdminPanel = () => {
  return htmlTemplate({
    title: "CMS",
    body: `
      <div id="cms-root"></div>
      <script src="/admin/static/index.js" type="module"></script>
    `,
  });
};
