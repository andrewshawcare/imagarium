module.exports = ({ origin }) => {
  const googleImages = {
    cache: {}
  };

  var computePixelRatio = () => {
    const context = document.createElement("canvas").getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStorePixelRatio =
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1;

    return devicePixelRatio / backingStorePixelRatio;
  };

  const createHiDPICanvas = (width, height) => {
    const pixelRatio = computePixelRatio();

    const canvas = document.createElement("canvas");

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const context = canvas.getContext("2d");
    context.setTransform(
      pixelRatio, // horizontalScaling
      0, // verticalSkewing
      0, // horizontalSkewing
      pixelRatio, // verticalScaling
      0, // horizontalTranslation
      0 // verticalTransation
    );

    return canvas;
  };

  const generateErrorMessageImage = ({ response, width, height }) => {
    const canvasElement = createHiDPICanvas(width, height);
    const context = canvasElement.getContext("2d");
    context.font = "24px sans-serif";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      `${response.status}: ${response.statusText}`,
      width / 2,
      height / 2,
      width
    );
    const canvasImageData = canvasElement.toDataURL();
    const imageElement = new Image(width, height);
    imageElement.setAttribute("src", canvasImageData);
    return imageElement;
  };

  return {
    googleImagesSearchToImageElement: async ({ query }) => {
      const { cache } = googleImages;

      if (query in cache) {
        return cache[query];
      }

      const urlSearchParams = new URLSearchParams({
        query,
        resultCount: 1,
        safetyLevel: "active"
      });

      const searchResponse = await fetch(
        `${origin}/google-images/search?${urlSearchParams}`
      );

      if (searchResponse.status !== 200) {
        return generateErrorMessageImage({
          response: searchResponse,
          width: 300,
          height: 150
        });
      }

      const searchResponseJson = await searchResponse.json();

      const {
        items: [
          {
            title,
            image: { thumbnailHeight, thumbnailWidth, thumbnailLink }
          }
        ]
      } = searchResponseJson;

      const imageElement = new Image(thumbnailWidth, thumbnailHeight);
      imageElement.setAttribute("alt", title);
      imageElement.setAttribute("src", thumbnailLink);

      cache[query] = imageElement;

      return imageElement;
    },
    dalleImageGenerationToImageElement: async ({ prompt, width, height }) => {
      const urlSearchParams = new URLSearchParams({
        prompt,
        width,
        height,
        variations: 1
      });
      const imageGenerationResponse = await fetch(
        `${origin}/dalle/generate-image?${urlSearchParams}`
      );

      if (imageGenerationResponse.status !== 200) {
        return generateErrorMessageImage({
          response: imageGenerationResponse,
          width: width,
          height: height
        });
      }

      const {
        data: [{ url }]
      } = await imageGenerationResponse.json();

      const imageElement = new Image(width, height);
      imageElement.setAttribute("alt", prompt);
      imageElement.setAttribute("src", url);

      return imageElement;
    },
    midjourneyImageGenerationToImageElement: async ({
      prompt,
      width,
      height
    }) => {
      const urlSearchParams = new URLSearchParams({ prompt });
      const imageGenerationResponse = await fetch(
        `${origin}/midjourney/generate-image?${urlSearchParams}`
      );

      if (imageGenerationResponse.status !== 200) {
        return generateErrorMessageImage({
          response: imageGenerationResponse,
          width: width,
          height: height
        });
      }

      const { uri } = await imageGenerationResponse.json();

      const imageElement = new Image(width, height);
      imageElement.setAttribute("alt", prompt);
      imageElement.setAttribute("src", uri);

      return imageElement;
    }
  };
};
