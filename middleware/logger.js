import { format } from "date-fns";
import { v4 as uuid } from 'uuid';
import path from "path";
import fs from "fs";
import fsPromises from "fs";
fsPromises.promises;

const eventLog = async (msg, logFileName) => {
  const dateTime = format(new Date(), "dd-MM-yyyy\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${msg}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  eventLog(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  // console.log(`${req.method} ${req.path}`);
  next();
};

export { eventLog, logger };
