const ImageElementCreator = require("image-element-creator");

module.exports = (node, graph) => {
  const imageElementCreator = ImageElementCreator({
    origin: configuration.serverOrigin
  });

  async function generateImageAndRenderCanvas() {
    const prompt = promptInput.value;

    if (typeof prompt !== "string" || prompt === "") {
      return;
    }

    node.comment = `Generating: ${prompt}`;

    const imageElement =
      await imageElementCreator.dalleImageGenerationToImageElement({
        prompt: prompt,
        width: 512,
        height: 512
      });
    imageElement.setAttribute("id", "dalle");

    const sceneImageElement = graph.sceneContainer.querySelector("#dalle");

    if (sceneImageElement) {
      sceneImageElement.replaceWith(imageElement);
    } else {
      graph.sceneContainer.appendChild(imageElement);
    }

    node.comment = prompt;
  }

  const promptInput = node.in("Prompt");
  const generateImageInput = node.in(
    "DALL·E: Generate Image",
    generateImageAndRenderCanvas,
    { connectable: false }
  );
};
