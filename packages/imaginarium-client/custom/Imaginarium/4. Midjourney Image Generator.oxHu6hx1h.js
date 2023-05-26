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
      await imageElementCreator.midjourneyImageGenerationToImageElement({
        prompt: prompt,
        width: 512,
        height: 512
      });
    imageElement.setAttribute("id", "midjourney");

    const sceneImageElement = graph.sceneContainer.querySelector("#midjourney");

    if (sceneImageElement) {
      sceneImageElement.replaceWith(imageElement);
    } else {
      graph.sceneContainer.appendChild(imageElement);
    }

    node.comment = prompt;
  }

  const promptInput = node.in("Prompt");
  const generateImageInput = node.in(
    "Midjourney: Generate Image",
    generateImageAndRenderCanvas,
    { connectable: false }
  );
};
