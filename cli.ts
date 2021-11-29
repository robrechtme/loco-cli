#!/usr/bin/env node
import { Command } from "commander";

import pull from "./src/commands/pull";
import push from "./src/commands/push";
import status from "./src/commands/status";
import { version } from "./package.json";

const program = new Command("loco-cli")
  .version(version)
  .option("-p, --personal-access-token <token>", "Loco API token");

program
  .command("pull")
  .argument("<out_dir>", "Path to directory to write to")
  .description("Fetch assets from Loco")
  .action(pull);

program
  .command("push")
  .argument("<input-file>", "Path to JSON file to upload from")
  .option(
    "-t, --tag [tag]",
    'Tag to add to all newly uploaded assets, e.g. "1.1.0"'
  )
  .option("-s, --status [status]", "Loco API token", "provisional")
  .description("Upload assets to Loco")
  .action(push);

program
  .command("status")
  .argument("<reference-file>", "Path to JSON file containing local assets")
  .description("Check status of local file")
  .action(status);

program.parse(process.argv);
