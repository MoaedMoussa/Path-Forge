import { setupApp } from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

setupApp().then(app => {
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening");
  });
}).catch(err => {
  logger.error({ err }, "Error starting server");
  process.exit(1);
});

