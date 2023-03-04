#!/usr/bin/env node

import { Command } from "commander";

import run from "./commands/run";
import exec from "./commands/exec";

const commander = new Command();

commander.option("-d, --debug", "output extra information", false);

commander.on("option:debug", () => {
	process.env.debug = JSON.stringify(true);
});

commander.addCommand(run);
commander.addCommand(exec);

commander.parse();
