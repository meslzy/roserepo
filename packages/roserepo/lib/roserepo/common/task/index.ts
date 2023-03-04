import roserepo from "~/roserepo";

import Workspace from "~roserepo/workspace";

import BaseRunner from "~roserepo/monorepo/runner/base";
import BaseExecutor from "~roserepo/workspace/executor/base";

import Cache from "~roserepo/common/cache";

class Task {
	private environmentVariables: Record<string, string>;
	script: string;
	workspace: Workspace;
	runner: BaseRunner<unknown>;
	executor: BaseExecutor<unknown>;

	constructor( script: string, workspace: Workspace, runner: BaseRunner<any>, executor: BaseExecutor<any> ) {
		this.script = script;
		this.workspace = workspace;
		this.runner = runner;
		this.executor = executor;
	}

	getCache = ( type: "runner" | "executor" ) => {
		const {skipCache, cache} = this[ type ].config;

		return [ skipCache, cache ];
	};

	start = async () => {
		await this.executor.prepare(this);

		const [ skipRunnerCache, runnerCache ] = this.getCache("runner");
		const [ skipExecutorCache, executorCache ] = this.getCache("executor");

		const caches: any[] = [];

		if ( runnerCache ) {
			caches.push(runnerCache);
		}

		if ( executorCache ) {
			caches.push(executorCache);
		}

		if ( (caches.length === 0) || (skipRunnerCache || skipExecutorCache) ) {
			return this.executor.execute();
		}

		const cache = Cache.multiple({
			caches,
		});

		await cache.prepare(this);

		const canRun = await cache.compute();

		if ( canRun ) {
			this.workspace.logger.info("Executing task, cache miss");

			await this.executor.execute();

			await cache.save();
		} else {
			this.workspace.logger.info("Skipping execution, cache hit");
		}
	};

	getEnvironmentVariables = () => {
		if ( this.environmentVariables ) {
			return this.environmentVariables;
		}

		const environmentVariables: Record<string, string> = {};

		Object.entries(roserepo.monorepo.getDotEnv(this.script)).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		Object.entries(roserepo.monorepo.config.env ?? {}).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		Object.entries(this.runner.config.env ?? {}).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		Object.entries(this.workspace.getDotEnv(this.script)).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		Object.entries(this.workspace.config.env ?? {}).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		Object.entries(this.executor.config.env ?? {}).forEach(( [ key, value ] ) => {
			environmentVariables[ key ] = value.toString();
		});

		this.environmentVariables = environmentVariables;

		return this.environmentVariables;
	};
}

export default Task;