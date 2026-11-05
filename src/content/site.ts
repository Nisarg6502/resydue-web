/**
 * Every word on the site lives here.
 *
 * Anything in [square brackets] is a placeholder that has not been confirmed
 * by a test or a decision. It renders as a dashed "to be confirmed" token so it
 * can never be mistaken for a real claim. Replace the bracket with the real
 * value and the token disappears automatically.
 *
 * House rule from the content brief: never show a figure or certificate we do
 * not hold.
 */

export const site = {
  name: "Resydue",
  url: "https://www.resydue.com",
  tagline: "What's left, made to hold.",
  contact: {
    whatsapp: "[number]",
    email: "[address]",
    phone: "[number]",
    location: "[location]",
    regions: "[regions]",
  },
} as const;

export const nav = [
  { href: "/products", label: "Range" },
  { href: "/coating", label: "The coating" },
  { href: "/standard", label: "Standard" },
  { href: "/for-owners", label: "For owners" },
  { href: "/story", label: "Story" },
] as const;

export const footerNav = [
  {
    title: "Packaging",
    links: [
      { href: "/products", label: "The range" },
      { href: "/coating", label: "The bio-based coating" },
      { href: "/standard", label: "The Resydue Standard" },
      { href: "/samples", label: "Free samples" },
    ],
  },
  {
    title: "Resydue",
    links: [
      { href: "/for-owners", label: "For owners" },
      { href: "/story", label: "Our story" },
      { href: "/journal", label: "Journal" },
      { href: "/faq", label: "FAQ" },
    ],
  },
] as const;

export type Status = "Available" | "In development" | "[Status]" | "[Available / In development]";

export type Product = {
  slug: string;
  name: string;
  short: string; // home-page one-liner
  forWhat: string; // products-page use line
  status: Status;
  image: string;
  imageAlt: string;
  homeSpecs: string[];
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "bowl",
    name: "Resydue Bowl",
    short: "For soups, curries and noodles. Holds hot food, hands cool.",
    forWhat: "Soups, curries, noodles and rice bowls.",
    status: "Available",
    image: "/images/bowls-stacked-salad.jpg",
    imageAlt: "Resydue bowls stacked beside an open bowl of salad with a fitted lid",
    homeSpecs: ["Made from [material]", "Holds [X]°C food for [X] hours", "Sizes: [X, Y, Z ml]"],
    specs: [
      { label: "Sizes", value: "[X ml / Y ml / Z ml]" },
      { label: "Heat tolerance", value: "Up to [X]°C" },
      { label: "Microwave safe", value: "[yes / no]" },
      { label: "Lid fit", value: "[snap / press]" },
    ],
  },
  {
    slug: "box",
    name: "Resydue Box",
    short: "For burgers, biryani and meal boxes. Rides well, stacks tight.",
    forWhat: "Burgers, wraps, biryani and meal boxes.",
    status: "Available",
    image: "/images/clamshell-open-meal.jpg",
    imageAlt: "Open three-compartment Resydue box holding sandwiches, fries and falafel",
    homeSpecs: ["Tested for [X] minutes in transit", "Compartments: [yes / no]"],
    specs: [
      { label: "Sizes", value: "[list]" },
      { label: "Grease resistance", value: "[rating]" },
      { label: "Transit test", value: "[X] minutes, [result]" },
    ],
  },
  {
    slug: "cup",
    name: "Resydue Cup and Lid",
    short: "For hot drinks and cold. A lid that actually fits.",
    forWhat: "Hot and cold drinks.",
    status: "[Available / In development]",
    image: "/images/cup-in-hand.jpg",
    imageAlt: "A hand holding a plain white Resydue cup",
    homeSpecs: ["Lining: no plastic", "Sizes: [list]"],
    specs: [
      { label: "Hot hold time", value: "[X] minutes" },
      { label: "Lid", value: "[sip / flat]" },
      { label: "Sizes", value: "[list]" },
    ],
  },
  {
    slug: "tray",
    name: "Resydue Tray",
    short: "For starters, sides and takeaway platters.",
    forWhat: "Starters, sides and takeaway platters.",
    status: "[Status]",
    image: "/images/tray-held-curry-rice.jpg",
    imageAlt: "A compartment tray of curry, rice and salad held over a stack of Resydue trays",
    homeSpecs: [],
    specs: [
      { label: "Sizes", value: "[list]" },
      { label: "Stackable", value: "[yes / no]" },
    ],
  },
];

export const home = {
  meta: {
    title: "Resydue | Plastic-free food packaging, made with Bio based coating",
    description:
      "Bowls, boxes and cups made from biodegradable substances with no plastic lining. Built for hot, oily, busy kitchens. Try free samples.",
  },
  hero: {
    eyebrow: "Plastic-free food packaging",
    title: ["What's", "left,", "made", "to", "hold."],
    body: "Resydue turns virgin paper into food packaging that carries hot, saucy, real-world meals. No plastic lining. Just a clear way back to the soil.",
    primary: { label: "Get free samples", href: "/samples" },
    secondary: { label: "Meet the range", href: "/products" },
  },
  lining: {
    eyebrow: "01 — The problem",
    title: "The lining is where plastic hides",
    body: "A box can look like paper and still carry a thin plastic skin to keep sauce in. That skin is what makes packaging hard to compost. Resydue was built to do the same job without it.",
  },
  worstDay: {
    eyebrow: "02 — The test",
    title: "Built for the worst day, not the demo",
    body: "Friday rush. Rain. A 40-minute ride. A tray of oily noodles at 90 degrees. We test for the day your packaging has to prove itself, and we publish what we find.",
  },
  range: {
    eyebrow: "03 — The range",
    title: "The range",
    cta: { label: "See all products", href: "/products" },
  },
  standard: {
    eyebrow: "04 — The rule",
    title: "One standard, three promises",
    body: "Every Resydue pack must answer three questions in a single line: what is it made of, how does it perform, and where does it go next? If we cannot answer all three with proof, it does not ship.",
    lines: [
      { k: "Made of", q: "What is it made of?" },
      { k: "Performs", q: "How does it perform?" },
      { k: "Goes next", q: "Where does it go next?" },
    ],
    cta: { label: "Read the Resydue Standard", href: "/standard" },
  },
  breakIt: {
    title: "Try to break it",
    body: "We will send you sample packs, free. Fill them, shake them, stack them, send them out for delivery. Tell us what fails.",
    cta: { label: "Get free samples", href: "/samples" },
  },
};

export const productsPage = {
  meta: {
    title: "Resydue range",
    // Brief reads "made from [crop residue]". Placeholder kept out of the search snippet until confirmed.
    description:
      "Explore the Resydue range: bowls, delivery boxes, cups and lids with no plastic lining.",
  },
  title: "Packaging with a day job.",
  body: "Each pack in the Resydue range does one thing well: carries food from your kitchen to your customer, without drama. Browse by what you serve.",
  custom: {
    title: "Your brand, pressed into the fibre",
    body: "Add your logo with [method].",
    terms: "Minimum for custom runs: [X] units. Lead time: [X] weeks.",
    primary: { label: "Request a custom quote", href: "/samples?intent=custom" },
    secondary: { label: "Get free samples", href: "/samples" },
  },
};

export const coatingPage = {
  meta: {
    title: "What Resydue is made of | The coating story",
    description:
      "What goes into a Resydue pack, and what never does: no plastic lining and no PFAS. The bio-based coating, explained.",
  },
  eyebrow: "The bio-based coating",
  title: "A pack you can trace back to a field.",
  body: "Most packaging pages stop at “plant-based.” We would rather show you the field.",
  notIn: {
    title: "What is not in it",
    items: ["No plastic lining", "No PFAS"],
  },
  layers: [
    { name: "Food", note: "Hot, oily, saucy. The real thing." },
    { name: "Bio-based coating", note: "Keeps sauce in. [coating material]" },
    { name: "Paper fibre", note: "The structure. [fibre source]" },
  ],
};

export const standardPage = {
  meta: {
    title: "The Resydue Standard | Test results and certificates",
    description:
      "Heat, leak, grease and compost results for every Resydue pack, with downloadable reports.",
  },
  title: "If we say it, we can show it.",
  body: "The Resydue Standard is the rule we hold ourselves to. Every claim on this website links to a test or a certificate. If it does not, it does not belong here.",
  promise: {
    title: "The three-line promise",
    items: [
      { k: "Material", v: "We name the fibre and everything else in the pack." },
      { k: "Performance", v: "We give hold times, temperatures and leak rates." },
      { k: "End of life", v: "We say where it goes, how long it takes and under what conditions." },
    ],
  },
  documents: {
    title: "Documents",
    items: [
      { name: "Food-contact safety report", type: "PDF", href: null },
      { name: "Heat and leak report", type: "PDF", href: null },
      { name: "Spec sheets for each product", type: "PDF", href: null },
    ],
  },
  yourTurn: {
    title: "Your turn",
    body: "Do not take our word for it. Order samples and run your own worst-case Friday.",
  },
};

export const ownersPage = {
  meta: {
    title: "Resydue for cafés, restaurants and cloud kitchens",
    description:
      "Fewer leaks, fewer complaints and packaging your customers will notice for the right reasons.",
  },
  title: "Your food deserves a better ride.",
  body: "You spend hours getting the dish right. Then it spends 40 minutes in a bag. Resydue is built for that journey.",
  leaks: {
    title: "Leaks cost more than the box",
    body: "One soggy delivery can mean a refund, a bad review and a customer who never comes back. A pack that holds is the cheapest thing you can fix.",
  },
  asks: {
    title: "What owners ask us first",
    items: [
      { q: "Will it leak?", a: "Tested for [X] hours at [X]°C and [X] minutes of transit." },
      { q: "What will it cost?", a: "About [X] per pack at [X] units. We will compare it with your current pack on a call." },
      { q: "Will customers care?", a: "Plastic-free is a reason to order again. Your logo goes on the pack." },
      { q: "Is it hard to order?", a: "Minimum [X] units, delivery in [X] days." },
    ],
  },
};

export const storyPage = {
  meta: {
    title: "About Resydue | Why we turn crop leftovers into packaging",
    description: "Meet the team behind Resydue and the idea that started in a field.",
  },
  title: "It started with a field fire.",
  body: "[Founder name] watched [crop residue] burn at [place]. Down the road, a café owner was throwing away leaking boxes. Two problems, one fix. That was the beginning of Resydue.",
  beliefs: {
    title: "What we believe",
    items: [
      "Packaging should earn its place in a kitchen, not just on a label.",
      "A claim without a test is just a slogan.",
      "Small kitchens deserve the same quality as big chains.",
    ],
  },
  team: {
    title: "The team",
    people: [
      { role: "Founder", name: "[Name]" },
      { role: "Process lead", name: "[Name]" },
      { role: "Materials lead", name: "[Name]" },
    ],
    based: "Based in [location], serving [regions].",
  },
  goal: {
    title: "Where we are going",
    body: "[X] tonnes of crop residue turned into packaging by [year].",
  },
};

export const journalPage = {
  meta: {
    title: "Journal | Short reads for busy kitchens",
    description:
      "Plain-spoken pieces on packaging, delivery and what is actually in the box. Each takes under five minutes.",
  },
  title: "Short reads for busy kitchens.",
  body: "Plain-spoken pieces on packaging, delivery and what is actually in the box. Each takes under five minutes.",
  articles: [
    { title: "Why paper cups and boxes often hide a plastic skin, and how to check yours", tag: "What's in the box" },
    { title: "Hot food, cold truth: how heat affects different packaging materials", tag: "Heat" },
    { title: "What “compostable” means, and the three questions to ask any supplier", tag: "End of life" },
  ],
  newsletter: {
    title: "Newsletter",
    body: "One email a month. A packaging tip, a kitchen story and a new test result. Nothing else.",
    cta: "Join the newsletter",
  },
};

export const faqPage = {
  meta: {
    title: "Resydue FAQ | Heat, cost, compost and ordering",
    description: "Quick answers on how Resydue packs handle heat, leaks, compost, price and orders.",
  },
  title: "Straight answers.",
  groups: [
    {
      title: "Heat and leaks",
      items: [
        { q: "Will it leak?", a: "Tested for [X] hours at [X]°C and [X] minutes of transit. Every result is published in the Resydue Standard." },
        { q: "How hot can the food be?", a: "The Resydue Bowl holds food up to [X]°C. Each product's heat tolerance is listed on its spec sheet." },
        { q: "Is it microwave safe?", a: "[yes / no]. We will confirm per product on the spec sheet." },
      ],
    },
    {
      title: "Materials and compost",
      items: [
        { q: "Is there plastic in it?", a: "No plastic lining. The coating that keeps sauce in is bio-based." },
        { q: "Does it contain PFAS?", a: "No PFAS." },
        { q: "Where does it go after use?", a: "[End-of-life route], in [X] [weeks], under [conditions]. We only state what we can prove." },
      ],
    },
    {
      title: "Price and ordering",
      items: [
        { q: "What will it cost?", a: "About [X] per pack at [X] units. We will compare it with your current pack on a call." },
        { q: "What is the minimum order?", a: "Minimum [X] units, delivery in [X] days." },
        { q: "Can I put my logo on it?", a: "Yes. Minimum for custom runs: [X] units. Lead time: [X] weeks." },
        { q: "Can I try before I buy?", a: "Yes. Tell us what you serve and we will send [10] packs that suit your menu, free." },
      ],
    },
  ],
};

export const samplesPage = {
  meta: {
    title: "Get free Resydue samples | Try to break them",
    description: "Request free plant-fibre food packs and test them on your real menu.",
  },
  title: "Try to break it.",
  body: "Tell us what you serve. We will send [10] packs that suit your menu, free.",
  businessTypes: ["Café", "Restaurant", "Cloud kitchen", "Packaged food"],
  serves: ["Hot food", "Drinks", "Cold food"],
  volumes: ["Under 1,000", "1,000 – 5,000", "5,000 – 20,000", "20,000+"],
  submit: "Send me samples",
  next: {
    title: "What happens next",
    steps: [
      "We confirm within [X] hours",
      "Samples arrive in [X] days",
      "A week later we call to hear what broke, and what did not",
    ],
  },
  talk: { title: "Prefer to talk?" },
};
