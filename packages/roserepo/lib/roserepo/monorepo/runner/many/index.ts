import { logger } from "~shared/logger";

import BaseRunner from "~roserepo/monorepo/runner/base";

type ManyRunnerConfig = unknown;

class ManyRunner extends BaseRunner<ManyRunnerConfig> {
	run = async () => {
		const workspaces = this.getFilteredWorkspaces({
			byScriptOrExecutor: true,
		});

		if ( workspaces.length === 0 ) {
			return logger.warn(`No workspaces found for runner "${logger.mark(this.script)}"`);
		}

		const tasks = this.createTasks(this.script, workspaces);

		logger.info(`Running ${workspaces.length} workspaces`, {
			lineAfter: true,
		});

		return this.runTasks(tasks);
	};
}

export type {
	ManyRunnerConfig,
};

export default ManyRunner;