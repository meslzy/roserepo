import nodemon from "nodemon";

import { deepMerge } from "@shared/utils";

import BaseExecutor from "~roserepo/workspace/executor/base";

import { spawn } from "child_process";

interface NodeExecutorConfig {
	file: string;
	args?: string[];
	watch?: boolean | nodemon.Settings;
}

class NodeExecutor extends BaseExecutor<NodeExecutorConfig> {

	watch = ( watch: nodemon.Settings | boolean, file: string, args: string[] ) => new Promise<void>(( resolve ) => {
		let watchConfig: nodemon.Settings = {
			env: this.task.getEnvironmentVariables(),
			script: file,
			args,
			cwd: this.task.workspace.location,
			stdout: false,
			verbose: false,
		};

		if ( typeof watch === "object" ) {
			watchConfig = deepMerge(watchConfig, watch);
		}

		const nodeWatcher = nodemon(watchConfig);

		nodeWatcher.on("log", ( log ) => {
			this.task.workspace.logger.info(`${log.message}`);
		});

		nodeWatcher.on("stdout", ( data ) => {
			this.task.workspace.logger.log(data?.toString());
		});

		nodeWatcher.on("stderr", ( data ) => {
			this.task.workspace.logger.log(data?.toString());
		});

		nodeWatcher.on("exit", ( code ) => {
			this.task.workspace.logger.info(`Exited with code ${code}`);

			if ( code === "SIGUSR2" ) {
				return;
			}

			return resolve();
		});
	});

	execute = async () => new Promise<void>(( resolve, reject ) => {
		const {watch, file, args} = this.config;

		if ( ! file ) {
			throw new Error("No file specified!");
		}

		if ( typeof (file as unknown) !== "string" ) {
			throw new Error("File must be a string!");
		}

		if ( watch ) {
			return this.watch(watch, file, args ?? []);
		}

		const childProcess = spawn("node", [ file, ...args ?? [] ], {
			cwd: this.task.workspace.location,
			env: this.task.getEnvironmentVariables(),
			stdio: [ "inherit", "pipe", "pipe" ],
			shell: true,
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
	NodeExecutorConfig,
};

export default NodeExecutor;