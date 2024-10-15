import { walk, ensureDir, dirname, join, relative, emptyDir, CSS, render, minify, emojify } from "./deps.ts"

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

const LOG: boolean = Deno.args.includes("build") || Deno.args.includes("test");
const iconhref = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij4NCiAgPHN0eWxlPg0KICAgIHBhdGggew0KICAgICAgZmlsbDogIzAwMDAwMDsNCiAgICB9DQoNCiAgICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKSB7DQogICAgICBwYXRoIHsNCiAgICAgICAgZmlsbDogI0ZGRkZGRjsNCiAgICAgIH0NCiAgICB9DQoNCiAgICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCkgew0KICAgICAgcGF0aCB7DQogICAgICAgIGZpbGw6ICMwMDAwMDA7DQogICAgICB9DQogICAgfQ0KICA8L3N0eWxlPg0KICA8cGF0aCBkPSJNOCAwYzQuNDIgMCA4IDMuNTggOCA4YTguMDEzIDguMDEzIDAgMCAxLTUuNDUgNy41OWMtLjQuMDgtLjU1LS4xNy0uNTUtLjM4IDAtLjI3LjAxLTEuMTMuMDEtMi4yIDAtLjc1LS4yNS0xLjIzLS41NC0xLjQ4IDEuNzgtLjIgMy42NS0uODggMy42NS0zLjk1IDAtLjg4LS4zMS0xLjU5LS44Mi0yLjE1LjA4LS4yLjM2LTEuMDItLjA4LTIuMTIgMCAwLS42Ny0uMjItMi4yLjgyLS42NC0uMTgtMS4zMi0uMjctMi0uMjctLjY4IDAtMS4zNi4wOS0yIC4yNy0xLjUzLTEuMDMtMi4yLS44Mi0yLjItLjgyLS40NCAxLjEtLjE2IDEuOTItLjA4IDIuMTItLjUxLjU2LS44MiAxLjI4LS44MiAyLjE1IDAgMy4wNiAxLjg2IDMuNzUgMy42NCAzLjk1LS4yMy4yLS40NC41NS0uNTEgMS4wNy0uNDYuMjEtMS42MS41NS0yLjMzLS42Ni0uMTUtLjI0LS42LS44My0xLjIzLS44Mi0uNjcuMDEtLjI3LjM4LjAxLjUzLjM0LjE5LjczLjkuODIgMS4xMy4xNi40NS42OCAxLjMxIDIuNjkuOTQgMCAuNjcuMDEgMS4zLjAxIDEuNDkgMCAuMjEtLjE1LjQ1LS41NS4zOEE3Ljk5NSA3Ljk5NSAwIDAgMSAwIDhjMC00LjQyIDMuNTgtOCA4LThaIj48L3BhdGg+DQo8L3N2Zz4=";

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
  const html = render(emojify(content), {
    allowMath: true,
    allowIframes: true,
    // Recommended to be false. If you wish to add features like buttons, you can change it to true.
    disableHtmlSanitization: false
  });

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
      <link rel="icon" type="image/x-icon" href="${iconhref}">
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
  if (LOG) console.log(emojify(":file_folder: Cleaning..."));
  await emptyDir("dist");
  Deno.writeTextFile("dist/styles.css", style);
  if (LOG) console.log(emojify(":cd: Parsing..."));
  for await (const walkEntry of walk(Deno.cwd() + "/md")) {
    if (walkEntry.isFile && walkEntry.name.endsWith(".md")) {
      if (LOG) console.log(emojify(":coffee: Processing file"), walkEntry.path);
      await mdToHtml(walkEntry.path);
    }
  }
  for await (const walkEntry of walk(Deno.cwd() + "/dist")) {
    if (walkEntry.isFile) {
      if (LOG) console.log(emojify(":bell: Cleaning file"), walkEntry.path);
      Deno.writeTextFile(walkEntry.path, await minify(walkEntry.path))
    }
  }
  if (LOG) console.log(emojify(":rocket: Ready to deploy"));
}

await main();

Deno.exit();