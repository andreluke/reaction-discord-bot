export function filterContent(text: string) {
    return text.replace(/<[^>]+>/g, "");
  }