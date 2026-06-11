const PORTRAITS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506863530036-6efeddac8a80?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531746020798-e6953b6e8e04?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1489424731088-a5d8b219eeba?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1519699047748-de8e456a91e6?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=600&fit=crop&crop=faces",
];

export function portraitFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % PORTRAITS.length;
  }
  return PORTRAITS[hash];
}

export function cdnImage(url) {
  if (!url) return "";
  return url;
}

export function imageFallback(name) {
  const label = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${label}&background=db18e7&color=fff&size=512&bold=true`;
}