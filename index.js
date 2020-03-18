const PORT = process.env.PORT || 8085;
const express = require("express");
const app = express();

app.use(express.static("."));

app.listen(PORT, () => {
  console.log("Web is running at port", PORT);
});
