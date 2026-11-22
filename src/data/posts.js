// Blog posts. To add one: append an object here. `body` is a list of blocks:
//   { type: 'p', text }  { type: 'h2', text }  { type: 'ul', items: [...] }  { type: 'code', text }
// Newest first.
export const POSTS = [
  {
    slug: 'building-this-site',
    title: 'Building this site by hand',
    date: 'Nov 2026',
    summary: 'Why I swapped a site-builder export for plain code, then added some React Bits.',
    body: [
      { type: 'p', text: 'This site started as a site-builder export. It looked right, but it was a wall of compiled code that was hard to edit. So I rebuilt it by hand.' },
      { type: 'h2', text: 'What changed' },
      { type: 'ul', items: [
        'React and Vite, with every section as a small component',
        'React Bits for the animated bits: the dot grid, cursor, text effects and logo loop',
        'Posts live in one file, so writing a new one takes a minute',
      ] },
      { type: 'p', text: 'This is placeholder text. Replace it with your own write-up.' },
    ],
  },
  {
    slug: 'hello-world',
    title: 'Hello, world',
    date: 'Nov 2026',
    summary: 'A first post. Notes on what I plan to write about here.',
    body: [
      { type: 'p', text: 'This is the first post on the new blog. It is a placeholder: replace it with your own writing.' },
      { type: 'p', text: 'To add a post, open src/data/posts.js and add another object to the list.' },
      { type: 'h2', text: 'What I plan to write about' },
      { type: 'ul', items: [
        'Building AI products and the lessons along the way',
        'Cybersecurity notes and tooling',
        'Student life, projects and what I am learning',
      ] },
      { type: 'code', text: "sudo make-coffee --strong" },
    ],
  },
];
