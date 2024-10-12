import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import { ensureDir } from "https://deno.land/std@0.170.0/fs/ensure_dir.ts";
import { dirname, join } from "https://deno.land/std@0.170.0/path/mod.ts";
import { emptyDir } from "https://deno.land/std@0.170.0/fs/empty_dir.ts";
import MarkdownIt from "npm:markdown-it";
import MarkdownItGitHubAlerts from "npm:markdown-it-github-alerts";
import { full as emoji } from 'npm:markdown-it-emoji'

const md = new MarkdownIt({
  html: true,
  linkify: true
}).use(MarkdownItGitHubAlerts).use(emoji);

async function mdToHtml(markdownPath: string): Promise<void> {
  const content = await Deno.readTextFile(markdownPath);
  const html = md.render(content);

  const relativePath = markdownPath.substring(Deno.cwd().length + 4);
  const outputPath = join("dist", relativePath.replace(".md", ".html"));
  await ensureDir(dirname(outputPath));

  const titleMatch = html.match(/<h1>(.*?)<\/h1>/i);
  let title = "Markdown Preview";
  if (titleMatch && titleMatch.length > 1) {
    title = titleMatch[1];
  }

  const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/github-markdown-css/5.6.1/github-markdown.css">
      <style>
        .markdown-body {
          box-sizing: border-box;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
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
      </style>
    </head>
    <body>
      <article class="markdown-body">
        ${html}
      </article>
    </body>
    <script>console.log("Made with Moska")</script>
    </html>
  `;
  await Deno.writeTextFile(outputPath, template);
}

async function main() {
  await emptyDir("dist");
  for await (const walkEntry of walk(Deno.cwd() + "/md")) {
    if (walkEntry.isFile && walkEntry.name.endsWith(".md")) {
      console.log("Processing file", walkEntry.path);
      await mdToHtml(walkEntry.path);
    }
  }
}

await main();

Deno.exit();