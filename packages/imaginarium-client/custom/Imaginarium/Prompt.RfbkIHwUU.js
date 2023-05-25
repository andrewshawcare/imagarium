module.exports = (node, graph) => {
  const subjectInput = node.in('Subject')
  const artistInput = node.in('Artist')
  const methodInput = node.in('Method')
  const movementInput = node.in('Movement')
  const styleInput = node.in('Style')

  const promptOutput = node.out('Prompt')

  subjectInput.onChange =
  artistInput.onChange =
  methodInput.onChange =
  movementInput.onChange =
  styleInput.onChange = () => {
    const promptContext = [
      subjectInput.value,
      artistInput.value,
      methodInput.value,
      movementInput.value,
      styleInput.value
    ]
    const prompt = promptContext.filter(Boolean).join(', ')
    node.comment = prompt
    promptOutput.setValue(prompt)
  }
};