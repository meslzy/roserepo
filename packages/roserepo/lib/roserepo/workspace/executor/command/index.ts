import BaseExecutor from "~roserepo/workspace/executor/base";

import { exec } from "child_process";

interface CommandExecutorConfig {
	command: string;
	args?: string[];
}

class CommandExecutor extends BaseExecutor<CommandExecutorConfig> {
	execute = async () => new Promise<void>(( resolve, reject ) => {
		const {command, args} = {
			command: this.config.command,
			args: this.config.args ?? [],
		};

		if ( ! command ) {
			throw new Error("Command is not defined");
		}

		if ( typeof (command as unknown) !== "string" ) {
			throw new Error("Command is not a string");
		}

		if ( ! Array.isArray(args) ) {
			throw new Error("Args is not an array");
		}

		const childProcess = exec(`${command} ${args.join(" ")}`, {
			cwd: this.task.workspace.location,
			env: this.task.getEnvironmentVariables(),
		});

		childProcess.stdout?.setEncoding("utf8");
		childProcess.stderr?.setEncoding("utf8");

		childProcess.stdout?.on("data", ( data ) => {
			return this.task.workspace.logger.log(data.toString());
		});
		childProcess.stderr?.on("data", ( data ) => {
			return this.task.workspace.logger.log(data.toString());
		});

		childProcess.on("close", ( code ) => {
			if ( code !== 0 ) {
				return reject(`Process exited with code ${code}`);
			} else {
				this.task.workspace.logger.info(`Process exited with code ${code}`);
				return resolve();
			}
		});

		childProcess.on("error", ( error ) => {
			return reject(error);
		});
	});
}

export type {
	CommandExecutorConfig,
};

export default CommandExecutor;