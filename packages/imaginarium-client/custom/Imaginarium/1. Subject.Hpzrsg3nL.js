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
      node.commentImage = await imageElementCreator.googleImagesSearchToImageElement({
        query: subject
      });
    }

    subjectOutput.setValue(subjectInput.value);
  };
};
