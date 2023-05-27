module.exports = ({ origin }) => {
  const googleImages = {
    cache: {}
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
        throw new Error(
          `${searchResponse.status}: ${searchResponse.statusText}`
        );
      }

      const searchResponseJson = await searchResponse.json();
      console.log({ searchResponseJson });

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
      const {
        data: [{ url }]
      } = await (
        await fetch(`${origin}/dalle/generate-image?${urlSearchParams}`)
      ).json();

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
      const { uri } = await (
        await fetch(`${origin}/midjourney/generate-image?${urlSearchParams}`)
      ).json();

      const imageElement = new Image(width, height);
      imageElement.setAttribute("alt", prompt);
      imageElement.setAttribute("src", uri);

      return imageElement;
    }
  };
};
