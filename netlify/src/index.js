const {
  client: amplienceClient,
  getStagingClient,
} = require("./middleware/amplienceConnector.js");
const {
  getMetaInfo,
  cleanUpNav,
  imageAltExtractor,
} = require("./common/utility.js");

let client = amplienceClient;

const getMainNav = async (deliveryKey, stagingSite) => {
  if (stagingSite) {
    client = getStagingClient(stagingSite);
  }

  const { body: mainNavResponse } =
    await client.getContentItemByKey(deliveryKey);
  const rootNav = {
    title: "Main navigation",
    children: [],
    ...mainNavResponse,
  };
  let mainNavigation = await getChildContents(
    mainNavResponse._meta.deliveryId,
    rootNav,
  );
  cleanUpNav(mainNavigation);

  const brandMenuCategoryIndex = mainNavigation?.children?.findIndex(
    (e) => e.menuType === "BRANDS",
  );
  const brandMenuCategory = mainNavigation?.children[brandMenuCategoryIndex];

  const brandsDetails = {};
  if (brandMenuCategory?.linkedPageId) {
    brandsDetails["menuType"] = "BRANDS";
    const linkedBrandsPage = await client.getContentItemById(
      brandMenuCategory.linkedPageId,
    );
    const { featuredBrands = [], otherBrands = [] } = linkedBrandsPage?.body;
    const dropdownBrands = featuredBrands
      .concat(otherBrands)
      ?.filter((e) => e.mainNavBrand);
    brandMenuCategory.children = dropdownBrands.map(imageAltExtractor);
  }
  mainNavigation.children[brandMenuCategoryIndex] = brandMenuCategory;
  return mainNavigation;
};

const getAllNestChildContents = async (id, cursor, parent = []) => {
  const { responses, page } = await client
    .filterByParentId(id)
    .page(12, cursor)
    .request({
      format: "inlined",
      depth: "all",
    });
  if (page.nextCursor) {
    await getAllNestChildContents(id, page.nextCursor, parent);
  }
  parent.push(responses);
  return parent;
};

const getChildContents = async (id, parent) => {
  try {
    const responses = await getAllNestChildContents(id);
    const contentResponses = responses.flat();

    let categoryContent = contentResponses
      ?.map((e) => getMetaInfo(e.content))
      .filter((e) => !e.hideCategory)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const consolidatedRecords = await Promise.all(
      categoryContent.map((e, i) => getChildContents(e.deliveryId, e)),
    );
    for (let i = 0; i < consolidatedRecords.length; i++) {
      categoryContent[i] = consolidatedRecords[i];
    }

    if (parent) {
      parent["children"] = categoryContent;
    }
  } catch (err) {
    console.log("---------Error------------", parent.title);
  }
  return parent;
};

module.exports = {
  getMainNav,
};
