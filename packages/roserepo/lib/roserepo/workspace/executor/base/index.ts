import { deepMerge } from "@shared/utils";

import BaseCache from "~roserepo/common/cache/base";

import Task from "~roserepo/common/task";

interface Config {
	env?: Record<string, string | boolean | number>;
	cache?: BaseCache<unknown>;
	skipCache?: boolean;
}

type WithExtends<ExecutorConfig> = {
	extends: string | BaseExecutor<any>;
} & Partial<ExecutorConfig & Config>;
type WithoutExtends<ExecutorConfig> = {
	extends?: undefined | null;
} & ExecutorConfig & Config;

type BaseExecutorConfig<ExecutorConfig> = WithExtends<ExecutorConfig> | WithoutExtends<ExecutorConfig>;

export abstract class BaseExecutor<ExecutorConfig> {
	runType: "monorepo" | "workspace" = "monorepo";

	task: Task;
	config: BaseExecutorConfig<ExecutorConfig>;

	constructor( config: BaseExecutorConfig<ExecutorConfig> ) {
		this.config = config;
	}

	private getExtendedConfig = ( executor?: string | BaseExecutor<any> ): BaseExecutorConfig<ExecutorConfig> => {
		if ( executor ) {
			if ( typeof executor === "string" ) {
				const extendedExecutor = this.task.workspace.getExecutor(executor);

				if ( ! extendedExecutor ) {
					throw new Error(`Cannot find executor "${executor}" to extend`);
				}

				if ( extendedExecutor.config.extends ) {
					return deepMerge(this.getExtendedConfig(extendedExecutor.config.extends), extendedExecutor.config);
				}

				return extendedExecutor.config;
			}

			if ( (executor as unknown) instanceof BaseExecutor ) {
				if ( executor.config.extends ) {
					return deepMerge(this.getExtendedConfig(executor.config.extends), executor.config);
				}

				return executor.config;
			}

			throw new Error(`Cannot extend executor "${executor}", it is not a BaseExecutor instance`);
		}

		if ( this.config.extends ) {
			return deepMerge(this.getExtendedConfig(this.config.extends), this.config);
		}

		return this.config;
	};

	abstract execute(): (Promise<any> | any);

	prepare = ( task: Task ) => {
		this.task = task;
		this.config = this.getExtendedConfig();
	};

	getScriptArgs = <T extends Record<string, string | boolean>>() => {
		const args = this.task.workspace.getScript(this.task.script).split(" ");

		const scriptArgs: Record<string, string | boolean> = {};

		args.forEach(( arg ) => {
			if ( arg.startsWith("--") ) {
				const [ key, value ] = arg.slice(2).split("=");
				scriptArgs[ key ] = value ?? true;
			}

			if ( arg.startsWith("-") ) {
				const [ key, value ] = arg.slice(1).split("=");
				scriptArgs[ key ] = value ?? true;
			}

			scriptArgs[ arg ] = true;
		});

		return scriptArgs as T;
	};
}

export type {
	BaseExecutorConfig,
};

export default BaseExecutor;