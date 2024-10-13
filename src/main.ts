import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import { ensureDir } from "https://deno.land/std@0.170.0/fs/ensure_dir.ts";
import { dirname, join, relative } from "https://deno.land/std@0.170.0/path/mod.ts";
import { emptyDir } from "https://deno.land/std@0.170.0/fs/empty_dir.ts";
import { CSS, render } from "jsr:@deno/gfm";
import { minify } from 'npm:minify';

import "npm:prismjs@1.29.0/components/prism-diff.js";
import "npm:prismjs@1.29.0/components/prism-javascript.js";
import "npm:prismjs@1.29.0/components/prism-typescript.js";
import "npm:prismjs@1.29.0/components/prism-jsx.js";
import "npm:prismjs@1.29.0/components/prism-tsx.js";
import "npm:prismjs@1.29.0/components/prism-css.js";
import "npm:prismjs@1.29.0/components/prism-cshtml.js";
import "npm:prismjs@1.29.0/components/prism-markdown.js";
import "npm:prismjs@1.29.0/components/prism-json.js";
import "npm:prismjs@1.29.0/components/prism-xml-doc.js";
import "npm:prismjs@1.29.0/components/prism-sql.js";
import "npm:prismjs@1.29.0/components/prism-bash.js";
import "npm:prismjs@1.29.0/components/prism-python.js";
import "npm:prismjs@1.29.0/components/prism-java.js";
import "npm:prismjs@1.29.0/components/prism-c.js";
import "npm:prismjs@1.29.0/components/prism-cpp.js";
import "npm:prismjs@1.29.0/components/prism-csharp.js";
import "npm:prismjs@1.29.0/components/prism-php-extras.js";
import "npm:prismjs@1.29.0/components/prism-ruby.js";
import "npm:prismjs@1.29.0/components/prism-go.js";
import "npm:prismjs@1.29.0/components/prism-swift.js";
import "npm:prismjs@1.29.0/components/prism-kotlin.js";
import "npm:prismjs@1.29.0/components/prism-rust.js";

import { emojify } from 'npm:node-emoji'

const BUILD = Deno.args.includes("build") || Deno.args.includes("test");

const style = `
        .markdown-body {
          box-sizing: border-box;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow:auto;
          margin: 0 auto;
          padding:45px;
          padding-left: 20%;
          padding-right: 20%;
        }
        @media (max-width: 767px) {
          .markdown-body {
            padding: 15px;
          }
        }
        ${CSS}
`

async function mdToHtml(markdownPath: string): Promise<void> {
  const content = await Deno.readTextFile(markdownPath);
  const html = render(emojify(content), { allowMath: true, allowIframes: true });

  const relativePath = markdownPath.substring(Deno.cwd().length + 4);
  const outputPath = join("dist", relativePath.replace(".md", ".html"));
  await ensureDir(dirname(outputPath));

  const titleMatch = content.match(/^(.*?)(?=\n|$)/s);
  let title = "Made with Moska :heart:";
  if (titleMatch && titleMatch.length > 1) {
    title = titleMatch[1].trim();
  }
  title = render(emojify(title)).replace(/<[^>]*>/g, '');

  const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/github-markdown-css/5.6.1/github-markdown.css">
      <link rel="stylesheet" href="./${relative(dirname(outputPath), "dist/styles.css")}">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/katorlys/prism-theme-github/themes/prism-theme-github-light.css">
    </head>
    <body>
      <main data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
        ${html}
      </main>
    </body>
    <script>console.log("Made with Moska")</script>
    </html>
  `;
  await Deno.writeTextFile(outputPath, template);
}

async function main() {
  if (BUILD) console.log(emojify(":file_folder: Cleaning..."));
  await emptyDir("dist");
  Deno.writeTextFile("dist/styles.css", style);
  if (BUILD) console.log(emojify(":cd: Parsing..."));
  for await (const walkEntry of walk(Deno.cwd() + "/md")) {
    if (walkEntry.isFile && walkEntry.name.endsWith(".md")) {
      console.log(emojify(":coffee: Processing file"), walkEntry.path);
      await mdToHtml(walkEntry.path);
    }
  }
  for await (const walkEntry of walk(Deno.cwd() + "/dist")) {
    if(walkEntry.isFile)Deno.writeTextFile(walkEntry.path, await minify(walkEntry.path))
  }
  if (BUILD) console.log(emojify(":rocket: Ready to deploy"));
}

await main();

Deno.exit();