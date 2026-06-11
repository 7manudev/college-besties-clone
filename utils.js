export function cdnImage(url) {
  if (!url) return "";
  if (
    url.startsWith("data:") ||
    url.includes("i0.wp.com") ||
    url.includes("i1.wp.com") ||
    url.includes("images.unsplash.com")
  ) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return `https://i0.wp.com/${parsed.hostname}${parsed.pathname}?ssl=1`;
  } catch {
    return url;
  }
}

export function imageFallback(name) {
  const label = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${label}&background=db18e7&color=fff&size=512&bold=true`;
}