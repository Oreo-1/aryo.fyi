// Project cards for the two swiper rows.
//
// imageClass picks how the cover image is fitted (styles live in app.css):
//   card-img-top                     -> cover
//   card-img-alternative             -> contain, small side margin
//   card-img-alternative-alternative -> cover, aligned to top
//
// psst add more cards here

export const projectRows = [
  [
    {
      title: "Aru",
      image: "https://raw.githubusercontent.com/Oreo-1/Aru/refs/heads/main/assets/gh/projectaruimg.png",
      imageClass: "card-img-top",
      description: "A dedicated Discord bot for my private server, one of the first projects that got me into coding. Featuring lots of if-statements and cringe jokes.",
      tags: [{ label: "JavaScript" }, { label: "Node.js" }],
      links: [
        { label: "View Repository", href: "https://git.aryo.fyi/Oreo-1/Aru" },
      ],
    },
    {
      title: "Tallé",
      image: "https://raw.githubusercontent.com/HainzelK/HantuProject/refs/heads/main/gh/Talle_logo.png",
      imageClass: "card-img-top",
      description: "A spell-casting augmented reality (AR) mobile game utilizing voice recognition, as a way to learn and preserve the Bugis-Lontara script.",
      tags: [{ label: "Unity" }, { label: "AR Core" }, { label: "Blender" }, { label: "Top 50 National (student category)", gold: true }],
      links: [
        // FIXME: signed, short-lived github attachment URL (jwt expired 2026-06-21), so this link is dead.
        // Re-host the preview somewhere permanent (release asset, youtube, your own server).
        { label: "📹 Watch Preview", href: "https://private-user-images.githubusercontent.com/121080759/598687134-dd2ceabe-72cd-4cad-a894-3422f0551304.mp4?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODIwNjY0NzQsIm5iZiI6MTc4MjA2NjE3NCwicGF0aCI6Ii8xMjEwODA3NTkvNTk4Njg3MTM0LWRkMmNlYWJlLTcyY2QtNGNhZC1hODk0LTM0MjJmMDU1MTMwNC5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjIxJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYyMVQxODIyNTRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0yNDg1OTVkZTRkMjJkODE1ZmU5YTVmZGM4YTVmYjg2ZWIyM2QyNmNjZmYzNzAxNmExMmFhOGYxYTJmNjAxZTA2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9dmlkZW8lMkZtcDQifQ.Sp1OcFq5aJs0w1tO-43c4iprVUNW76Ya3YWEf7oBrns", primary: true },
        { label: "GitHub", href: "https://github.com/HainzelK/HantuProject" },
      ],
    },
    {
      title: "Guardian Alam Raya: Utusan Dewata Abadi",
      image: "https://raw.githubusercontent.com/Gibekkk/GarudaKotak/refs/heads/main/gh-asset/garuda_title.png",
      imageClass: "card-img-top",
      description: "An action-adventure game made with Construct 2, utilizing Google's Teachable Machine to capture poses for in-game actions. Inspired by Indonesian mythology and folklore.",
      tags: [{ label: "Construct 2" }, { label: "Google TM" }, { label: "Computer Vision" }],
      links: [
        { label: "▶︎ Play Now", href: "https://garuda-kotak.vercel.app/", primary: true },
        { label: "GitHub", href: "https://github.com/Gibekkk/GarudaKotak" },
      ],
    },
    {
      title: "Order Here",
      image: "https://raw.githubusercontent.com/Oreo-1/uc-kiosk/refs/heads/main/OrderHere-Frontend/assets/advs1.png",
      imageClass: "card-img-alternative-alternative",
      description: "A self-serving kiosk. Features include mood-based food recommendation, blockchain transaction auditing system, and admin panel for canteen staff to manage menu items.",
      tags: [{ label: "Laravel" }, { label: "IoT" }, { label: "Blockchain" }],
      links: [
        { label: "GitHub", href: "https://github.com/Oreo-1/uc-kiosk" },
      ],
    },
  ],
  [
    {
      title: "soon™",
      image: "https://placehold.co/600x300",
      imageClass: "card-img-top",
      description: "upcoming platformer game project",
      tags: [{ label: "godot?" }, { label: "JavaScript?" }],
      links: [
        { label: "soon™", href: "", primary: true },
        { label: "View Repository (soon™)", href: "" },
      ],
    },
    {
      title: "Sapa Tellumpanua",
      image: "https://raw.githubusercontent.com/Oreo-1/sapatellumpanua-web/refs/heads/main/github-raws/l-min.png",
      imageClass: "card-img-top",
      description: "A concept website for Tellumpanua village; serves as a digital presence for the village, showcasing its culture, attractions, and community initiatives.",
      tags: [{ label: "Bootstrap" }, { label: "A-Frame" }, { label: "360° View" }],
      links: [
        { label: "Live Demo", href: "https://sapatellumpanua.web.app", primary: true },
        { label: "GitHub", href: "https://github.com/Oreo-1/sapatellumpanua-web" },
      ],
    },
    {
      title: "DuckType",
      image: "https://raw.githubusercontent.com/Oreo-1/Bebek-Kotak/refs/heads/main/assets/gh/gametitle.png",
      imageClass: "card-img-alternative",
      description: "A simple typing game made with Construct 2 featuring hand made assets, local & online leaderboards, and a duck mascot.",
      tags: [{ label: "Construct 2" }, { label: "Electron" }, { label: "🥇 1st Place IT Competition AMIKOM Surakarta 2025", gold: true }],
      links: [
        { label: "▶︎ Play Now", href: "https://oreo-1.github.io/Bebek-Kotak/", primary: true },
        { label: "GitHub", href: "https://github.com/Oreo-1/Bebek-Kotak" },
      ],
    },
    {
      title: "JAM",
      image: "https://raw.githubusercontent.com/Javinpro/ALP-Project-JAM-To-Do-List-/refs/heads/main/gh-assets/mockup-img.png",
      imageClass: "card-img-alternative",
      description: "A simple to-do list application made to streamline assignment process, tasks, and maximize productivity with various time management methods and progress tracker.",
      tags: [{ label: "Flutter" }, { label: "Django" }],
      links: [
        { label: "Visit Website", href: "https://jam-app-web.netlify.app/", primary: true },
        { label: "GitHub", href: "https://github.com/Javinpro/ALP-Project-JAM-To-Do-List-" },
      ],
    },
  ],
];
