const BotiumBindings = require("botium-bindings");
require("dotenv").config();

const convodirs = [];

if (process.env.TEST_SCOPE === "smoke") {
  convodirs.push(`__spec__/convo/smoke-tests`);
} else {
  convodirs.push(`__spec__/convo/smoke-tests`);
  convodirs.push(`__spec__/convo/integration-tests`);
}

const bb = new BotiumBindings({ convodirs });
BotiumBindings.helper.mocha().setupMochaTestSuite({ timeout: 120000, bb });
