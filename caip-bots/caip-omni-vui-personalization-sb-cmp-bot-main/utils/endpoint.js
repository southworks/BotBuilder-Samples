const fs = require("fs");
const path = require("path");

/**
 * Configure a server to serve manifest files.
 * @param server Web server to be configured.
 */
exports.configureManifestsEndpoint = (server) => {
  if (fs.existsSync("manifests")) {
    const manifestFiles = fs.readdirSync("manifests");
    const func = (file) => {
      return (_req, res) => {
        const manifest = JSON.parse(
          fs.readFileSync(path.join("manifests", file), "utf8")
        );
        res.send(manifest);
      };
    };
    for (const file of manifestFiles) {
      if (file.endsWith(".json")) {
        server.get(`/api/manifests/${file}`, func(file));
      }
    }
  }
};

/**
 * Configure health endpoint
 * @param server Web server to be configured.
 */
exports.configureHealthEndpoint = (server) => {
  server.get("/", (_req, res) => {
    res.sendStatus(200);
  });
  server.get("/api/health", (_req, res) => {
    res.sendStatus(200);
  });
};

/**
 * Configure availability endpoint
 * @param server Web server to be configured.
 */
exports.configureAvailabilityEndpoint = (server) => {
  server.get("/api/availability", (_req, res) => {
    res.sendStatus(202);
  });
};
