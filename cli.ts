#!/usr/bin/env node
import { Command, Option } from "commander";

import pull from "./src/commands/pull";
import push from "./src/commands/push";
import status from "./src/commands/status";
import { version } from "./package.json";

const program = new Command("loco-cli")
  .version(version)
  .option("-a, --access-key <key>", "Loco API token")
  .option(
    "-d, --locales-dir <path>",
    "The folder in which the translations are stored.",
    "."
  )
  .option("-N, --namespaces", "Organize translations into namespaces", false);
program
  .command("pull")
  .option("-y, --yes", "Answer yes to all confirmation prompts", false)
  .option(
    "--filter [filter]",
    "Filter assets by comma-separated tag names. Match any tag with `*` and negate tags by prefixing with `!`."
  )
  .option(
    "--fallback [fallback]",
    "Fallback locale for untranslated assets, specified as short code. e.g. en or en_GB."
  )
  .addOption(
    new Option(
      "--order [order]",
      "Export translations according to asset order."
    ).choices(["created", "id"])
  )
  .option(
    "--status [status]",
    'Export translations with a specific status or flag. Negate values by prefixing with !. e.g. "translated", or "!fuzzy".'
  )
  .option(
    "--charset [charset]",
    "Specify preferred character encoding. Alternative to Accept-Charset header but accepts a single value which must be valid."
  )
  .addOption(
    new Option(
      "--breaks [breaks]",
      "Force platform-specific line-endings. Default is Unix (LF) breaks."
    ).choices(["Unix", "DOS", "Mac"])
  )
  .description("Fetch assets from Loco")
  .action(pull);

program
  .command("push")
  .option("-t, --tag [tag]", "Deprecated, use the `--tag-new` option instead.")
  .option(
    "-s, --status [status]",
    "Deprecated, use the `--flag-new` option instead."
  )
  .option("-y, --yes", "Answer yes to all confirmation prompts", false)
  .option(
    "--ignore-new",
    "Specify that new assets will NOT be added to the project."
  )
  .option(
    "--ignore-existing",
    "Specify that existing assets encountered in the file will NOT be updated."
  )
  .option(
    "--tag-new [tag-new]",
    "Tag any NEW assets added during the import with the given tags (comma separated)."
  )
  .option(
    "--tag-all [tag-all]",
    "Tag ALL assets in the file with the given tags (comma separated)."
  )
  .option(
    "--untag-all [untag-all]",
    "Remove existing tags from any assets matched in the imported file (comma separated)."
  )
  .option(
    "--tag-updated [tag-updated]",
    "Tag existing assets that are MODIFIED by this import."
  )
  .option(
    "--untag-updated [untag-updated]",
    "Remove existing tags from assets that are MODIFIED during import."
  )
  .option(
    "--tag-absent [tag-absent]",
    "Tag existing assets in the project that are NOT found in the imported file."
  )
  .option(
    "--untag-absent [untag-absent]",
    "Remove existing tags from assets NOT found in the imported file."
  )
  .option(
    "--delete-absent",
    "Permanently DELETES project assets NOT found in the file (use with extreme caution)."
  )
  .option(
    "--flag-new [flag-new]",
    "Set this flag on any NEW (non-empty) translations imported into the current locale."
  )
  .description("Upload assets to Loco")
  .action(push);

program
  .command("status")
  .addOption(
    new Option("--direction [direction]", "Direction to diff the assets IDs to")
      .choices(["remote", "local", "both"])
      .default("both")
  )
  .description("Check status of local file")
  .action(status);

program.parse(process.argv);
