import express from "express";
import path from "path";
import cors from "cors";

import { SERVER_PORT } from "./envVars.js";

import * as url from "url";
import * as fs from "fs";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.use(
  cors({
    origin: "*", // Allow only this origin to access
    methods: "GET,POST,PUT,DELETE", // Allow only these HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allow only these headers
    credentials: true, // Allow cookies
  }),
);

app.get("/*", async (req, res) => {
  console.log(req.headers.authorization);
  if (req.headers.authorization !== "test")
    return res.status(401).send("Unauthorized");

  const filename = req.path.replace("/", "");
  const root = path.resolve("./public");
  const pdfList = fs.readdirSync(root).filter((file) => file.includes(".pdf"));

  if (!filename)
    return res
      .status(200)
      .send(`<XML>${pdfList.map((pdf) => `<Key>${pdf}</Key>`).join("")}</XML>`);

  return pdfList.find((pdf) => pdf === filename)
    ? res.sendFile(filename, { root: __dirname.replace("/dist/", "/public") })
    : res.status(404).send(`File ${filename} not found`);
});

app.listen(SERVER_PORT, () => {
  console.info("Server is running on port 3000");
});
