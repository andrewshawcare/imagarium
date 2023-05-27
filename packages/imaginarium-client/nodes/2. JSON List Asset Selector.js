const ImageElementCreator = require("image-element-creator");

module.exports = async (node, graph) => {
  const imageElementCreator = ImageElementCreator({
    origin: configuration.serverOrigin
  });

  async function transitionStateAndRenderNode() {
    await transitionState();
    await renderNode();
  }

  async function transitionState() {
    const itemListAssetPath = itemListAssetPathInput.value;

    let itemList = [itemInput.default];
    let defaultSelectedItem = itemInput.default;

    if (itemListAssetPath !== itemListAssetPathInput.default) {
      itemList = await (await fetch(itemListAssetPath)).json();

      const itemListTitle = extractTitleFromAssetPath({
        assetPath: itemListAssetPath
      });
      if (!itemList.includes(itemListTitle)) {
        itemList.unshift(itemListTitle);
      }
      defaultSelectedItem = itemListTitle;
    }

    itemInput.options.values = itemList;

    let item = itemInput.value;

    if (!itemList.includes(item)) {
      item = defaultSelectedItem;
    }

    itemInput.value = item;

    itemOutput.setValue(
      enabledInput.value && item !== defaultSelectedItem ? item : ""
    );
  }

  async function renderNode() {
    const item = itemInput.value;
    const itemList = itemInput.options.values;

    node.comment = item;

    if (typeof item !== 'string' || item === '') {
      node.commentImage = undefined;
    } else {
      try {
        node.commentImage = await imageElementCreator.googleImagesSearchToImageElement({
          query: item
        })
      } catch (error) {
        const canvasElement = document.createElement("canvas");
        const context = canvasElement.getContext("2d");
        context.font = "20px sans-serif";
        context.fillStyle = "#FFFFFF"
        context.fillText(error, 10, 20)
        const canvasImageData = canvasElement.toDataURL();
        const imageElement = new Image(300, 150);
        imageElement.setAttribute("src", canvasImageData)
        node.commentImage = imageElement;
      }
    }
  }

  function extractTitleFromAssetPath({ assetPath }) {
    const titleRegularExpression = /(?<title>\w+)\..*$/;
    const matches = assetPath.match(titleRegularExpression);
    const title = matches.groups.title;
    return `${title[0].toUpperCase()}${title.slice(1)}`;
  }

  const itemListAssetPathInput = node.in("Item List", "", {
    type: "asset",
    connectable: false
  });
  itemListAssetPathInput.onChange = async (
    newItemListAssetPath,
    oldItemListAssetPath
  ) => {
    if (
      typeof newItemListAssetPath === "string" &&
      typeof oldItemListAssetPath === "string" &&
      newItemListAssetPath !== oldItemListAssetPath
    ) {
      await transitionStateAndRenderNode();
    }
  };

  const itemInput = node.in("Item", "", {
    type: "dropdown",
    values: [""],
    connectable: false
  });
  itemInput.onChange = async (newItem, oldItem) => {
    if (
      typeof newItem === "string" &&
      typeof oldItem === "string" &&
      newItem !== oldItem
    ) {
      await transitionStateAndRenderNode();
    }
  };

  const itemOutput = node.out("Output", itemInput.value);

  const enabledInput = node.in("Enabled", true, { connectable: false });
  enabledInput.onChange = async (newEnabled, oldEnabled) => {
    if (
      typeof newEnabled === "boolean" &&
      typeof oldEnabled === "boolean" &&
      newEnabled !== oldEnabled
    ) {
      await transitionStateAndRenderNode();
    }
  };

  node.onReady = transitionStateAndRenderNode;
};
