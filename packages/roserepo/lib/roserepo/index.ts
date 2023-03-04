import { TypedEmitter } from "tiny-typed-emitter";

import type { MonorepoConfig } from "./monorepo";
import Monorepo, { defineMonorepo } from "./monorepo";

import type { WorkspaceConfig } from "./workspace";
import Workspace, { defineWorkspace } from "./workspace";

import Runner from "~roserepo/monorepo/runner";
import type { BaseRunnerConfig } from "~roserepo/monorepo/runner/base";
import BaseRunner from "~roserepo/monorepo/runner/base";

import Executor from "~roserepo/workspace/executor";
import type { BaseExecutorConfig } from "~roserepo/workspace/executor/base";
import BaseExecutor from "~roserepo/workspace/executor/base";

import Cache from "~roserepo/common/cache";
import type { BaseCacheConfig } from "~roserepo/common/cache/base";
import BaseCache from "~roserepo/common/cache/base";

interface Types {
}

namespace roserepo {
	export const emitter = new TypedEmitter<Types>();

	export let monorepo: Monorepo;
	export let workspaces: Workspace[];

	export const initializeMonorepo = async () => {
		monorepo = await Monorepo.loadMonorepo();
	};
	export const initializeWorkspaces = async () => {
		workspaces = await monorepo.loadWorkspaces();
	};

	export const run = async ( script: string ) => {
		let runner = monorepo.getRunner(script);

		if ( ! runner ) {
			runner = Runner.many({
				parallel: true,
			});
		}

		runner.prepare(script, workspaces);

		return runner.run();
	};
}

export type {
	MonorepoConfig,
	WorkspaceConfig,
	//
	BaseRunnerConfig,
	BaseExecutorConfig,
	BaseCacheConfig,
};

export {
	Monorepo,
	defineMonorepo,
	Workspace,
	defineWorkspace,
	//
	Runner,
	BaseRunner,
	//
	Executor,
	BaseExecutor,
	//
	Cache,
	BaseCache,
};

export default roserepo;