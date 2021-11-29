#!/usr/bin/env node
import { Command } from "commander";
import pull from "./src/commands/pull";
import push from "./src/commands/push";
import status from "./src/commands/status";
import { version } from "./package.json";

const program = new Command("loco-cli");
program.version(version);

program
  .command("pull")
  .argument("<output-file>", "Path to directory to write to")
  .requiredOption("-t, --api-token <token>", "Loco API token")
  .description("Fetch assets from Loco")
  .action(pull);

program
  .command("push")
  .argument("<input-file>", "Path to JSON file to upload from")
  .requiredOption("-t, --api-token <token>", "Loco API token")
  .description("Upload assets to Loco")
  .action(push);

program
  .command("status")
  .argument("<reference-file>", "Path to JSON file containing local assets")
  .requiredOption("-t, --api-token <token>", "Loco API token")
  .description("Check status of local file")
  .action(status);

program.parse(process.argv);
