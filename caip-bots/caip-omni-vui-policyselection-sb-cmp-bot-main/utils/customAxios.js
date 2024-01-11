const Agent = require("agentkeepalive");
const axios = require("axios").default;

const keepAliveAgent = new Agent({
  maxSockets: 160,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});
const keepAliveAgentHttps = new Agent.HttpsAgent({
  maxSockets: 160,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const axiosInstance = axios.create({
  httpAgent: keepAliveAgent,
  httpsAgent: keepAliveAgentHttps,
});

module.exports = axiosInstance;
