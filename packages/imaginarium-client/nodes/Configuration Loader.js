module.exports = async (node, graph) => {
  const configurationAssetInput = node.in(
    'Configuration Asset',
    'assets/configuration.json',
    {
      type: 'asset',
      filter: '.json',
      connectable: false
    }
  );

  async function updateConfiguration() {
    const configurationAsset = configurationAssetInput.value;
    const configuration = await (await fetch(configurationAsset)).json()
    for (const [key, value] of Object.entries(configuration)) {
      graph.sceneContainer.dataset[key] = value;
    }
  }

  configurationAssetInput.onChange = updateConfiguration;
  node.onReady = updateConfiguration;
};
