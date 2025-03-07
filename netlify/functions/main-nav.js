const dotenv = require("dotenv");
const { getMainNav } = require("../src/index.js");
const {
  isNetlifyBlobEnabled,
  storeDataToNetlify,
  fetchDataFromNetlify,
} = require("../src/middleware/netlifyBlobStore.js");
const logger = require("../src/common/logger.js");

dotenv.config();

console.log("--------AMPLIENCE_HUB----", process.env.AMPLIENCE_HUB);
console.log("--------CACHE_MAX_AGE----", process.env.CACHE_MAX_AGE);

const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE ?? 3600;

const handler = async (req, context) => {
  const { purgecache, deliveryKey, stagingSite } = req.queryStringParameters;

  if (!deliveryKey) {
    return res.status(500).send({
      message: "Please pass deliveryKey variable in the query params",
    });
  }

  let mainNavigation;
  if (isNetlifyBlobEnabled()) {
    if (purgecache) {
      logger.info("--------------cache purged---------------");
      mainNavigation = await getMainNav(deliveryKey, stagingSite);
    } else {
      mainNavigation = await fetchDataFromNetlify(deliveryKey);
    }
  }
  if (!mainNavigation) {
    mainNavigation = await getMainNav(deliveryKey, stagingSite);
  }
  if (isNetlifyBlobEnabled() && (purgecache || !mainNavigation)) {
    logger.info(
      `--------------netlify data stored--------------- ${mainNavigation}`,
    );
    storeDataToNetlify(deliveryKey, mainNavigation);
  }

  const headers = {
    "Content-Type": "application/json",
    "CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}, must-revalidate`,
    "Netlify-CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}, must-revalidate`,
  };

  return {
    body: JSON.stringify(mainNavigation),
    statusCode: 200,
    headers,
  };
};

module.exports = {
  handler,
};
