const dotenv = require("dotenv");
const logger = require("../common/logger.js");
const { getStore } = require("@netlify/blobs");
dotenv.config();

const isNetlifyBlobEnabled = () => {
  const blobStoreEnabled = process.env.NETLIFY_BLOB_STORE === "true";
  logger.info(`------ Netlify Blobstore Enabled ----- ${blobStoreEnabled}`);
  return blobStoreEnabled;
};

const storeDataToNetlify = async (deliveryKey, jsonData) => {
  try {
    const amplienceDataStore = getStore(process.env.AMPLIENCE_HUB);
    amplienceDataStore.setJSON(deliveryKey, jsonData);
  } catch (err) {}
};

const fetchDataFromNetlify = async (deliveryKey) => {
  try {
    const amplienceDataStore = getStore(process.env.AMPLIENCE_HUB);
    return await amplienceDataStore.get(deliveryKey);
  } catch (err) {
    return null;
  }
};

module.exports = {
  isNetlifyBlobEnabled,
  storeDataToNetlify,
  fetchDataFromNetlify,
};
