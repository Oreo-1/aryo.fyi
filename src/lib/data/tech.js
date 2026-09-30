// Tools & Technologies. Rows are rendered top to bottom, groups left to right.
// `wrap` = bootstrap column classes of the group, `item` = column classes of each tech card.
const icon = (name) => `/assets/icons/${name}-icon.svg`;

export const techRows = [
  [
    {
      title: "DevOps & Server",
      wrap: "col-12",
      item: "col-6 col-md-4 col-lg-2",
      items: [
        { name: "Docker", icon: icon("docker") },
        { name: "Git", icon: icon("git") },
        { name: "Ubuntu/Debian", icon: icon("ubuntu"), alt: "Ubuntu" },
        { name: "Cloudflare", icon: icon("cloudflare") },
        { name: "Nginx", icon: icon("nginx") },
        { name: "n8n", icon: icon("n8n") },
      ],
    },
  ],
  [
    {
      title: "Web Development",
      wrap: "col-12 col-lg-6",
      item: "col-4",
      items: [
        { name: "TypeScript", icon: icon("typescript") },
        { name: "Node.js", icon: icon("nodejs") },
        { name: "Bootstrap", icon: icon("bootstrap") },
      ],
    },
    {
      title: "Cross Platform Development",
      wrap: "col-12 col-lg-6",
      item: "col-4",
      items: [
        { name: "Flutter", icon: icon("flutter") },
        { name: "Electron", icon: icon("electron") },
        { name: "Tauri", icon: icon("tauri") },
      ],
    },
  ],
];
