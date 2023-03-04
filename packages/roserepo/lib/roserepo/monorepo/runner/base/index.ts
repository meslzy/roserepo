import { WorkspaceFilter } from "@shared/types";
import { deepMerge } from "@shared/utils";

import { logger } from "~shared/logger";

import Workspace from "~roserepo/workspace";

import Executor from "~roserepo/workspace/executor";

import BaseExecutor from "~roserepo/workspace/executor/base";
import BaseCache from "~roserepo/common/cache/base";

import Task from "~roserepo/common/task";
import roserepo from "~/roserepo";

interface FilteredOptions {
	ByScript?: boolean | string;
	ByExecutor?: boolean | string;
	byScriptOrExecutor?: boolean | string;
}

interface Config {
	env?: Record<string, string | boolean | number>;
	executor?: BaseExecutor<unknown>;
	cache?: BaseCache<unknown>;
	skipCache?: boolean;
	parallel?: boolean;
	restartOnError?: boolean;
	throwOnError?: boolean;
	include?: WorkspaceFilter[];
	exclude?: WorkspaceFilter[];
}

type WithExtends<RunnerConfig> = {
	extends: string | BaseRunner<any>;
} & Partial<RunnerConfig & Config>;
type WithoutExtends<RunnerConfig> = {
	extends?: undefined | null;
} & RunnerConfig & Config;

type BaseRunnerConfig<RunnerConfig> = WithExtends<RunnerConfig> | WithoutExtends<RunnerConfig>;

abstract class BaseRunner<RunnerConfig> {
	script: string;
	workspaces: Workspace[];
	config: BaseRunnerConfig<RunnerConfig>;

	constructor( config: BaseRunnerConfig<RunnerConfig> ) {
		this.config = config;
	}

	private getExtendedConfig = ( runner?: string | BaseRunner<any> ): BaseRunnerConfig<RunnerConfig> => {
		if ( runner ) {
			if ( typeof runner === "string" ) {
				const extendedRunner = roserepo.monorepo.getRunner(runner);

				if ( ! extendedRunner ) {
					throw new Error(`Cannot find runner "${runner}" to extend`);
				}

				if ( extendedRunner.config.extends ) {
					return deepMerge(this.getExtendedConfig(extendedRunner.config.extends), extendedRunner.config);
				}

				return extendedRunner.config;
			}

			if ( (runner as unknown) instanceof BaseRunner ) {
				if ( runner.config.extends ) {
					return deepMerge(this.getExtendedConfig(runner.config.extends), runner.config);
				}

				return runner.config;
			}

			throw new Error(`Cannot extend runner "${runner}", it is not a BaseRunner instance`);
		}

		if ( this.config.extends ) {
			return deepMerge(this.getExtendedConfig(this.config.extends), this.config);
		}

		return this.config;
	};

	abstract run(): (Promise<any> | any);

	prepare = ( script: string, workspaces: Workspace[] ) => {
		this.script = script;
		this.workspaces = workspaces;
		this.config = this.getExtendedConfig();
	};

	//

	getFilteredWorkspaces = ( options?: FilteredOptions ) => {
		const {monorepo} = roserepo;

		const priorityInclude = this.config.include ?? [];
		const priorityExclude = this.config.exclude ?? [];

		const include = monorepo.config.include ?? [];
		const exclude = monorepo.config.exclude ?? [];

		const filteredWorkspaces: Workspace[] = [];

		this.workspaces.forEach(( workspace ) => {
			if ( priorityInclude.length ) {
				if ( priorityInclude.some(( filter ) => workspace.matchesFilter(filter)) ) {
					return filteredWorkspaces.push(workspace);
				}

				return;
			}

			if ( priorityExclude.length ) {
				if ( priorityExclude.some(( filter ) => workspace.matchesFilter(filter)) ) {
					return;
				}
			}

			if ( include.length ) {
				if ( include.some(( filter ) => workspace.matchesFilter(filter)) ) {
					return filteredWorkspaces.push(workspace);
				}

				return;
			}

			if ( exclude.length ) {
				if ( exclude.some(( filter ) => workspace.matchesFilter(filter)) ) {
					return;
				}
			}

			filteredWorkspaces.push(workspace);
		});

		if ( options === undefined ) {
			return filteredWorkspaces;
		}

		return filteredWorkspaces.filter(( workspace ) => {
			if ( options.ByScript ) {
				const script = typeof options.ByScript === "string" ? options.ByScript : this.script;

				return workspace.hasScript(script);
			}

			if ( options.ByExecutor ) {
				const executor = typeof options.ByExecutor === "string" ? options.ByExecutor : this.script;

				return workspace.hasExecutor(executor);
			}

			if ( options.byScriptOrExecutor ) {
				const scriptOrExecutor = typeof options.byScriptOrExecutor === "string" ? options.byScriptOrExecutor : this.script;

				return workspace.hasScriptOrExecutor(scriptOrExecutor);
			}

			return true;
		});
	};

	//

	createTask = ( script: string, workspace: Workspace, runner?: BaseRunner<unknown> ): Task => {
		runner = runner ?? this;

		let executor = workspace.getExecutor(script);

		if ( ! executor ) {
			if ( runner.config.executor ) {
				executor = runner.config.executor;
			} else {
				executor = Executor.script({
					script,
				});
			}
		}

		return new Task(script, workspace, runner ?? this, executor);
	};

	createTasks = ( script: string, workspaces: Workspace[] ) => {
		return workspaces.map(( workspace ) => {
			return this.createTask(script, workspace);
		});
	};

	runTask = async ( task: Task ): Promise<any> => {
		try {
			await task.start();
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				task.workspace.logger.error(error.message);
			} else {
				task.workspace.logger.error(error);
			}

			if ( task.runner.config.restartOnError ) {
				logger.info(`Restarting ${logger.mark(task.script)} in workspace ${logger.mark(task.workspace.name)}`, {
					lineBefore: true,
					lineAfter: true,
				});

				return this.runTask(task);
			}

			if ( task.runner.config.throwOnError ) {
				const message = `Script ${logger.mark(task.script)} failed in workspace ${logger.mark(task.workspace.name)}`;

				throw new Error(message, {
					cause: error,
				});
			}
		}
	};

	runTasks = async ( tasks: Task[] ) => {
		const tasksTable = tasks.reduce<Task[][]>(( tasksTable, task ) => {
			if ( tasksTable.length === 0 ) {
				tasksTable.push([ task ]);
				return tasksTable;
			}

			const lastTasks = tasksTable[ tasksTable.length - 1 ];
			const lastTask = lastTasks[ lastTasks.length - 1 ];

			if ( task.runner.config.parallel && lastTask.runner.config.parallel ) {
				lastTasks.push(task);
			} else {
				tasksTable.push([ task ]);
			}

			return tasksTable;
		}, []);

		for ( const tasks of tasksTable ) {
			await Promise.all(tasks.map(( task ) => {
				return this.runTask(task);
			}));
		}
	};
}

export type {
	BaseRunnerConfig,
};

export default BaseRunner;