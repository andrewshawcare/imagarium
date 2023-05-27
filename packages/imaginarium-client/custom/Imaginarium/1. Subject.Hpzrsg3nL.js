const ImageElementCreator = require("image-element-creator");

module.exports = (node, graph) => {
  const imageElementCreator = ImageElementCreator({
    origin: configuration.serverOrigin
  });

  const subjectInput = node.in("Subject", "a happy goldendoodle puppy", {
    connectable: false
  });
  const subjectOutput = node.out("Output");

  subjectInput.onChange = async () => {
    const subject = subjectInput.value;
    node.comment = subject;

    if (typeof subject === "string" && subject !== "") {
      try {
        node.commentImage = await imageElementCreator.googleImagesSearchToImageElement({
          query: subject
        });
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

    subjectOutput.setValue(subjectInput.value);
  };
};
