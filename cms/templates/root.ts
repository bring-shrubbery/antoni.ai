export const htmlTemplate = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/admin/static/bundle.css" />
  <style>
    /* Ensure CMS root takes full viewport */
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #cms-root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
