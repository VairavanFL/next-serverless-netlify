/*Final cleanup and restructuring before sending response*/
const cleanUpNav = (parent) => {
  parent.children = parent.children.map((e) => {
    cleanUpNav(e);
    organiseMenuCarousel(e);
    const { parentDeliveryId, hideCategory, ...restProps } = e;
    return restProps;
  });
};

/*Amplience data structure and cleanup*/
const getMetaInfo = ({ _meta, page, title, ...rest }) => {
  const { deliveryId, hierarchy } = _meta;

  const brandsDetails = {};
  if (page?.contentType?.indexOf("brands-page") !== -1 && page?.id) {
    brandsDetails["menuType"] = "BRANDS";
  }

  return {
    deliveryId,
    linkedPageId: page?.id,
    title: title ?? _meta.name,
    parentDeliveryId: hierarchy?.parentId,
    children: [],
    ...rest,
    ...brandsDetails,
  };
};

const organiseMenuCarousel = (parent) => {
  const { inMenuCarousel } = parent;

  if (!inMenuCarousel) {
    return;
  }
  parent.inMenuCarousel = inMenuCarousel.map(imageAltExtractor);
};

/*Method to structure Image content with supporting props*/
const imageAltExtractor = ({ image, alt, ...restProps }) => {
  return {
    image: {
      url: processImageUrl(image),
      altText: alt,
    },
    ...restProps,
  };
};

/*Method to compose amplience image endpoint*/
const protocol = "https://";
const processImageUrl = (image) => {
  const { endpoint, defaultHost, name } = image;
  return protocol + defaultHost + "/i/" + endpoint + "/" + name;
};

module.exports = {
  cleanUpNav,
  getMetaInfo,
  imageAltExtractor,
  organiseMenuCarousel,
};
