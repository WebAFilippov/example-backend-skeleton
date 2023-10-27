import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import {fileURLToPath} from 'url';

import { corsOptions } from "./config/corsOptions.js";
import { logger, eventLog } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoute from "./routes/userRoute.js";

const PORT = process.env.PORT;
const MONGO_DB = process.env.MONGO_DB;
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/", express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/users", userRoute);

try {
  mongoose.connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log(error);
}

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Соединение с MongoDB");
  app.listen(PORT, () => console.log(`Сервер запущен на ${PORT}`));
});

mongoose.connection.on("error", (error) => {
  console.log(error);
  eventLog(
    `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`,
    "mongoErrLog.log"
  );
});
