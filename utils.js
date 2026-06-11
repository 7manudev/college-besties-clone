const crop = "w=600&h=600&fit=crop&crop=faces";

const portrait = (id) => `https://images.unsplash.com/photo-${id}?${crop}`;

export const PORTRAIT_BY_NAME = {
  "Addison B": portrait("1544005313-94ddf0286df2"),
  Amber: portrait("1534528741775-53994a69daeb"),
  Autumn: portrait("1524504388940-b1c1722653e1"),
  Blair: portrait("1573496359142-b8d87734a5a2"),
  Cora: portrait("1438761681033-6461ffad8d80"),
  Estelle: portrait("1487412720507-e7ab37603c6f"),
  Hartley: portrait("1517841905240-472988babdf9"),
  Jordin: portrait("1529626455594-4ff0802cfb7e"),
  Jovie: portrait("1502823403499-6ccfcf4fb453"),
  Kimmy: portrait("1508214751196-bcfd4ca60f91"),
  Kelsey: portrait("1507591064344-4c6ce005b128"),
  Loren: portrait("1580489944761-15a19d654956"),
  Miley: portrait("1594744803329-e58b31de8bf5"),
  Piper: portrait("1520813792240-56fc4a3765a7"),
  Quinn: portrait("1494790108377-be9c29b29330"),
  Reagan: portrait("1619895862022-09114b41f16f"),
  Stephanie: portrait("1607746882042-944635dfe10e"),
  Gia: portrait("1566492031773-4f4e44671857"),
};

const BACKUP_PORTRAITS = [
  portrait("1546961329-78bef0414d7c"),
  portrait("1464983953574-0892a716854b"),
  portrait("1531121624034-ffb1aa2569fe"),
];

export function portraitFor(name) {
  if (PORTRAIT_BY_NAME[name]) return PORTRAIT_BY_NAME[name];

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % BACKUP_PORTRAITS.length;
  }
  return BACKUP_PORTRAITS[hash];
}

export function cdnImage(url) {
  if (!url) return "";
  return url;
}

export function imageFallback(name) {
  return portraitFor(name) || BACKUP_PORTRAITS[0];
}