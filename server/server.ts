import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import {Request, Response} from "express";
import fs from "fs";
const startTime: Date = new Date();
const port: number = 8000;
const app: express.Application = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function addZero(value: number): string {
  if (value < 10) { return `0${value}`; } else { return value + ""; }
}

app.post("/status", (req: Request, res: Response) => {
  const allSeconds = Math.round((Date.now() - startTime.getTime()) / 1000);
  const hours = Math.floor(allSeconds / (60 * 60));
  const minutes = Math.floor((allSeconds - hours * 60 * 60) / 60);
  const seconds = Math.round(allSeconds - hours * 60 * 60 - minutes * 60);
  res.send(`${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`);
});

app.post("/api/events", (req: Request, res: Response) => {
  const body = req.body;
  const types = body.types;
  if (!types.includes("critical") && !types.includes("info")) {
    res.status(400).send("incorrect type");
  } else {
    fs.readFile("events.json", "utf8", (err: Error, data: string) => {
      if (err) { throw err; }
      const startPosition = (body.page - 1) * body.itemsPerPage;
      const endPosition = startPosition + body.itemsPerPage;
      const dataFromFile = JSON.parse(data);
      const result = dataFromFile.events.filter((el: {type: "critical" | "info"}) =>
       types.indexOf(el.type) !== -1).slice(startPosition, endPosition);
      res.json({events: result});
    });
  }
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).send("<h1>Page not found</h1>");
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
