import BaseRunner from "~roserepo/monorepo/runner/base";

interface MultipleRunnerConfig {
	runners?: BaseRunner<any>[];
	parallel?: boolean;
	stopOnError?: boolean;
}

class MultipleRunner extends BaseRunner<MultipleRunnerConfig> {
	run = async () => {
		const {runners, parallel, stopOnError} = this.config;

		if ( ! runners ) {
			throw new Error("Executors are not defined");
		}

		if ( ! Array.isArray(runners) ) {
			throw new Error("Executors are not an array");
		}

		runners.forEach(( runner: unknown ) => {
			if ( runner instanceof BaseRunner ) {
				return;
			}

			throw new Error("Runner must be an instance of BaseRunner");
		});

		runners.forEach(( runner ) => {
			runner.prepare(this.script, this.workspaces);
		});

		if ( parallel ) {
			const promises = runners.map(( runner ) => {
				return runner.run();
			});

			if ( stopOnError ) {
				await Promise.all(promises);
			} else {
				await Promise.allSettled(promises);
			}
		} else {
			for ( const runner of runners ) {
				try {
					await runner.run();
				} catch ( error ) {
					if ( stopOnError ) {
						throw error;
					}
				}
			}
		}
	};
}

export type {
	MultipleRunnerConfig,
};

export default MultipleRunner;