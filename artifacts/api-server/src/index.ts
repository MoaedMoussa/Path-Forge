import { setupApp } from "./app";
import { logger } from "./lib/logger";

const port = 3000;

setupApp().then(app => {
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening");
  });
}).catch(err => {
  logger.error({ err }, "Error starting server");
  process.exit(1);
});

