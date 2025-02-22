export const generatePrompt = (
  basePrompt: string,
  style: string,
  color: string,
  lighting: string,
  category: string,
  perspective: string,
  composition: string,
  medium: string,
  mood: string,
  tags: string[]
) => {
  let prompt = basePrompt;

  if (style && style !== "None") {
    prompt += `, ${style} style`;
  }
  if (color && color !== "None") {
    prompt += `, ${color} color scheme`;
  }
  if (lighting && lighting !== "None") {
    prompt += `, ${lighting} lighting`;
  }
  if (perspective && perspective !== "None") {
    prompt += `, ${perspective} perspective`;
  }
  if (composition && composition !== "None") {
    prompt += `, ${composition} composition`;
  }
  if (medium && medium !== "None") {
    prompt += `, ${medium} medium`;
  }
  if (mood && mood !== "None") {
    prompt += `, ${mood} mood`;
  }
  if (category) {
    prompt += `, ${category}`;
  }
  if (tags.length > 0) {
    prompt += `, ${tags.join(", ")}`;
  }

  return prompt;
};
