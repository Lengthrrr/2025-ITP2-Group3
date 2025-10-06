const app = require("./app");
const port = process.env.PORT || 8001;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${port}`);
});

