export const htmlTemplate = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => `<!DOCTYPE html>
<head lang="en">
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  ${body}
</body>
</html>`;
