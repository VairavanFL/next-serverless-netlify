const dotenv = require("dotenv");
const { ContentClient } = require("dc-delivery-sdk-js");
dotenv.config();

const client = new ContentClient({
  hubName: process.env.AMPLIENCE_HUB,
});

const getStagingClient = (stagingEnvironment) => {
  return new ContentClient({
    hubName: process.env.AMPLIENCE_HUB,
    stagingEnvironment,
  });
};

module.exports = {
  client,
  getStagingClient,
};
