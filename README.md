# Moska

A tool to build static webpages with markdown and deploy to github pages.

See documentations at https://dilemmagx.github.io/Moska/.

For developments, this repo provided two helper deno tasks `init:src` and `init:test`. After coloning this repo, it's suggested to run `init:test` to make the testing folder. New changes should be made in the test folder, and test by running `test` task. After finishing up editing, run `init:src` to copy files in `test/` to `src/`. `test/` is ignored in `.gitignore`.