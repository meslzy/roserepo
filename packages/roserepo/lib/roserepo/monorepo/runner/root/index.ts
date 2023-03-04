import roserepo from "~/roserepo";

import BaseRunner from "~roserepo/monorepo/runner/base";

interface RootRunnerConfig {
	script: string;
}

class RootRunner extends BaseRunner<RootRunnerConfig> {
	run = async () => {
		const script = this.config.script;

		if ( ! script ) {
			throw new Error("Script is required");
		}

		if ( typeof (script as unknown) !== "string" ) {
			throw new Error("Script must be a string");
		}

		return roserepo.run(script);
	};
}

export type {
	RootRunnerConfig,
};

export default RootRunner;