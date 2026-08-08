export const topNavItems = [
  { label: "Home", href: "/" },
  { label: "Usage", href: "/usage.html" },
  { label: "Playground", href: "/playground.html" },
  { label: "Benchmarks", href: "/benchmarks.html" },
  { label: "Migration", href: "/migration.html" },
  { label: "GitHub", href: "https://github.com/karpatic/bundless" },
];

export const docsSections = [
  {
    title: "Start",
    items: [
      { id: "usage", label: "Usage", href: "/usage.html" },
      { id: "getting-started", label: "Run the first page", href: "/docs/getting-started.html" },
    ],
  },
  {
    title: "Use Bundless",
    items: [
      { id: "modules", label: "Load modules", href: "/docs/guides/modules.html" },
      { id: "typescript", label: "Use TypeScript and TSX", href: "/docs/guides/typescript.html" },
      { id: "prefetch", label: "Prefetch modules", href: "/docs/features/prefetch.html" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "runtimes", label: "Choose a runtime", href: "/docs/reference/runtimes.html" },
      { id: "troubleshooting", label: "Troubleshooting", href: "/docs/troubleshooting.html" },
    ],
  },
  {
    title: "Build later",
    items: [
      { id: "migration", label: "Move to Webpack", href: "/migration.html" },
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
