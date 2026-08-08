export const topNavItems = [
  { label: "Home", href: "/" },
  { label: "Usage Docs", href: "/usage.html" },
  { label: "Migration", href: "/migration.html" },
  { label: "Playground", href: "/playground.html" },
  { label: "Benchmarks", href: "/benchmarks.html" },
  { label: "GitHub", href: "https://github.com/karpatic/bundless" },
];

export const docsSections = [
  {
    title: "Start",
    items: [
      { id: "usage", label: "Usage Docs", href: "/usage.html" },
      { id: "getting-started", label: "Getting Started", href: "/docs/getting-started.html" },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "modules", label: "Modules and Imports", href: "/docs/guides/modules.html" },
      { id: "typescript", label: "TypeScript and TSX", href: "/docs/guides/typescript.html" },
    ],
  },
  {
    title: "Features",
    items: [
      { id: "prefetch", label: "Prefetch", href: "/docs/features/prefetch.html" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "runtimes", label: "Runtime Choices", href: "/docs/reference/runtimes.html" },
      { id: "troubleshooting", label: "Troubleshooting", href: "/docs/troubleshooting.html" },
    ],
  },
  {
    title: "Move Later",
    items: [
      { id: "migration", label: "Webpack Migration", href: "/migration.html" },
    ],
  },
];

export function findPage(id) {
  for (let sectionIndex = 0; sectionIndex < docsSections.length; sectionIndex += 1) {
    const section = docsSections[sectionIndex];
    for (let itemIndex = 0; itemIndex < section.items.length; itemIndex += 1) {
      const item = section.items[itemIndex];
      if (item.id === id) {
        return item;
      }
    }
  }
  return docsSections[0].items[0];
}

export function findNextPage(id) {
  const flat = [];
  docsSections.forEach((section) => {
    section.items.forEach((item) => {
      flat.push(item);
    });
  });

  const index = flat.findIndex((item) => item.id === id);
  if (index < 0 || index >= flat.length - 1) {
    return null;
  }
  return flat[index + 1];
}
