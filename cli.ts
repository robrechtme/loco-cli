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
  .description("Fetch assets from Loco")
  .action(pull);

program
  .command("push")
  .option(
    "-t, --tag [tag]",
    "The tag option is removed in v2, use the `push.tag-new` option in `.locorc` instead"
  )
  .option(
    "-s, --status [status]",
    "The status option is removed in v2, use the `push.flag-new` option in `.locorc` instead"
  )
  .option("-y, --yes", "Answer yes to all confirmation prompts", false)
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
