import dotenv from "dotenv";
import { FileExistsSync } from "./utils";

dotenv.config();

export const Config = () => {
  const { NODE_ENV = "development" } = process.env;
  const environment = NODE_ENV?.toLowerCase();
  const environmentFileLocation = `${__dirname}/../environments`;
  const environmentFilePath = `${environmentFileLocation}/${environment}`;
  if (FileExistsSync(environmentFilePath)) {
    // eslint-disable-next-line
    const configuration = require(environmentFilePath).default();
    return configuration;
  }
  Logger.error(`Missing environment file for NODE_ENV=${environment}.`);
  throw Error(`Missing environment file for NODE_ENV=${environment}.`);
};

export default Config;
