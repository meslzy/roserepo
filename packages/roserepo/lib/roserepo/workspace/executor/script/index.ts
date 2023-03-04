import BaseExecutor from "~roserepo/workspace/executor/base";

import { spawn } from "child_process";

interface ScriptExecutorConfig {
	script: string;
}

class ScriptExecutor extends BaseExecutor<ScriptExecutorConfig> {
	logs: string[] = [];

	execute = async () => new Promise<void>(( resolve, reject ) => {
		const script = this.config.script;

		if ( ! script ) {
			return reject("No script specified");
		}

		if ( typeof (script as unknown) !== "string" ) {
			return reject("Script must be a string");
		}

		const npm = process.platform === "win32" ? "npm.cmd" : "npm";

		const childProcess = spawn(npm, [ "run", script ], {
			cwd: this.task.workspace.location,
			env: this.task.getEnvironmentVariables(),
			stdio: [ "inherit", "pipe", "pipe" ],
		});

		childProcess.stdout?.setEncoding("utf8");
		childProcess.stderr?.setEncoding("utf8");

		childProcess.stdout?.on("data", ( data ) => {
			this.logs.push(data.toString());
			return this.task.workspace.logger.log(data.toString());
		});
		childProcess.stderr?.on("data", ( data ) => {
			this.logs.push(data.toString());
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
	ScriptExecutorConfig,
};

export default ScriptExecutor;