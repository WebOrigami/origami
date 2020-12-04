const date = new Date();

export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>About</title>
  </head>
  <body>
    <h1>About</h1>
    <p>
      This page was created on ${date.toDateString()}.
    </p>
  </body>
</html>
`;
