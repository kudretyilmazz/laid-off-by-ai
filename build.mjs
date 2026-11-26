// Renders the privacy policy markdown (copied verbatim from the game repo's docs/legal) into static
// pages for GitHub Pages. Output paths are stable because they are pasted into store listings:
//   /                -> index (links + contact)
//   /privacy/en/     -> English policy
//   /privacy/tr/     -> Turkish policy
// Numbered "## 5. ..." headings get id="section-5" so a store form can link straight to a section.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Marked } from 'marked';

const CONTACT = 'kudretylmzzz@gmail.com';

const PAGES = {
  en: { title: 'Privacy Policy — Laid Off by AI', other: 'tr', otherLabel: 'Türkçe' },
  tr: { title: 'Gizlilik Politikası — Laid Off by AI', other: 'en', otherLabel: 'English' },
};

const marked = new Marked({
  renderer: {
    heading({ tokens, depth, text }) {
      const n = /^(\d+)\./.exec(text);
      const id = n ? ` id="section-${n[1]}"` : '';
      return `<h${depth}${id}>${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
  },
});

const STYLE = `
:root{--bg:#f7f7f5;--fg:#16181c;--muted:#5b616b;--line:#d9dbe0;--accent:#3a6b00;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#0B0D10;--fg:#e8eaed;--muted:#9aa1ab;--line:#2a2f37;--accent:#C6FF3D;--card:#13161b}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:32px 16px 64px}
nav{display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:24px}
a{color:var(--accent)}
h1{font-size:28px;line-height:1.25;margin:0 0 8px}
h2{font-size:20px;margin:32px 0 8px;scroll-margin-top:16px}
.table{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--card)}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
tr:last-child td{border-bottom:0}
th{color:var(--muted);font-weight:600}
em{color:var(--muted)}
footer{margin-top:48px;font-size:13px;color:var(--muted)}
`;

const shell = (lang, title, body) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>${STYLE}</style>
</head>
<body><main>
${body}
</main></body>
</html>
`;

function write(path, html) {
  mkdirSync(path, { recursive: true });
  writeFileSync(`${path}/index.html`, html);
}

for (const [lang, page] of Object.entries(PAGES)) {
  const md = readFileSync(`content/privacy-policy.${lang}.md`, 'utf8');
  // marked's GFM mode already links bare URLs and e-mail addresses.
  const html = marked.parse(md).replace(/<table>/g, '<div class="table"><table>').replace(/<\/table>/g, '</table></div>');
  const nav = `<nav><a href="../../">Laid Off by AI</a><a href="../${page.other}/" hreflang="${page.other}" lang="${page.other}">${page.otherLabel}</a></nav>`;
  write(`privacy/${lang}`, shell(lang, page.title, nav + html));
}

write('.', shell('en', 'Laid Off by AI', `
<h1>Laid Off by AI</h1>
<p>Privacy Policy: <a href="privacy/en/">English</a> · <a href="privacy/tr/" lang="tr" hreflang="tr">Türkçe</a></p>
<p>Contact / İletişim: <a href="mailto:${CONTACT}">${CONTACT}</a></p>
`));

writeFileSync('.nojekyll', '');
console.log('built: index.html, privacy/en/, privacy/tr/');
