import { emojify } from 'npm:node-emoji';
import { emptyDir } from "https://deno.land/std@0.170.0/fs/empty_dir.ts";
import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const mode = Deno.args[0];

if (!["src", "test"].includes(mode)) {
    console.error(emojify(":no_entry: Expect arg0 to be one of the followings: \"src\", \"test\""));
    Deno.exit(1);
}

async function copyFiles(sourceDir: string, targetDir: string) {
    console.log(emojify(":arrow_right: Starting to copy files from :open_file_folder: ") + sourceDir + emojify(" to :open_file_folder: ") + targetDir);
    for await (const walkEntry of walk(sourceDir)) {
        if (walkEntry.isFile) {
            const content = await Deno.readTextFile(walkEntry.path);
            const targetPath = targetDir + walkEntry.path.substring(sourceDir.length);
            await Deno.writeTextFile(targetPath, content);
            console.log(emojify(":white_check_mark: Copied file :page_facing_up: ") + walkEntry.path);
        }
    }
    console.log(emojify(":white_check_mark: Finished copying files from :open_file_folder: ") + sourceDir);
}

async function confirmAction(dir: string): Promise<boolean> {
    const confirmMessage = emojify(`:question: Confirm to process (:construction: ${dir}/ will be removed) (y/N)`);
    const rl = readline.createInterface({ input, output });
    const response = await rl.question(confirmMessage);
    rl.close();
    return response.trim().toLowerCase() === 'y';
}

async function main(mode: string) {
    console.log(emojify(":rocket: Starting the script with mode : ") + mode);

    const dirToClean = mode === "src" ? "src" : "test";
    if (!await confirmAction(dirToClean)) {
        console.log(emojify(":x: Operation cancelled by the user."));
        Deno.exit();
    }

    console.log(emojify(":bell: Cleaning directory :open_file_folder: ") + dirToClean);
    await emptyDir(dirToClean);
    if (mode === "src") {
        await copyFiles(Deno.cwd() + "/test", Deno.cwd() + "/src");
    } else {
        await copyFiles(Deno.cwd() + "/src", Deno.cwd() + "/test");
    }

    console.log(emojify(":checkered_flag: Script finished successfully"));
}

await main(mode);
Deno.exit();