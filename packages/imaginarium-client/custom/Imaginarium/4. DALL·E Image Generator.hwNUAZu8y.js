const ImageElementCreator = require("image-element-creator");

module.exports = (node, graph) => {
  const imageElementCreator = ImageElementCreator({
    origin: configuration.serverOrigin
  });

  const imageContainerElement = document.createElement("div");
  imageContainerElement.setAttribute("id", "dalle");

  const placeholderImageElement = new Image(512, 512);
  placeholderImageElement.setAttribute("src", "assets/logo-openai.png");

  async function generateImageAndRenderCanvas() {
    const prompt = promptInput.value;

    if (typeof prompt !== "string" || prompt === "") {
      return;
    }

    node.comment = `Generating: ${prompt}`;
    imageContainerElement.innerHTML = `
    <div class="hypnotic"></div>

    <style>
    .hypnotic {
      width: 512px;
      height: 512px;
      border: 3.5px solid #ffffff;
      background: conic-gradient(from 180deg at 50% calc(100% - 3.5px),#ffffff 90deg, #0000 0),
              conic-gradient(from 180deg at 50% calc(100% - 3.5px),#ffffff 90deg, #0000 0);
      background-position: 0 1.4px 0;
      background-size: 28.2px 16.9px;
      animation: hypnotic-c32cpvhg 1s infinite;
    }

    @keyframes hypnotic-c32cpvhg {
      100% {
          background-position: 0 -16.9px,14.1px 16.9px;
      }
    }
    </style>
    `;

    const generatedImageElement =
      await imageElementCreator.dalleImageGenerationToImageElement({
        prompt: prompt,
        width: 512,
        height: 512
      });

    imageContainerElement.innerHTML = "";
    imageContainerElement.appendChild(generatedImageElement);

    node.comment = prompt;
  }

  node.onReady = () => {
    imageContainerElement.innerHTML = "";
    imageContainerElement.appendChild(placeholderImageElement);

    if (!graph.sceneContainer.querySelector(`#${imageContainerElement.id}`)) {
      graph.sceneContainer.appendChild(imageContainerElement);
    }
  };

  const promptInput = node.in("Prompt");
  const generateImageInput = node.in(
    "DALL·E: Generate Image",
    generateImageAndRenderCanvas,
    { connectable: false }
  );
};
