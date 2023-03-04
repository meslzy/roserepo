import BaseExecutor from "~roserepo/workspace/executor/base";

interface MultipleExecutorConfig {
	executors: BaseExecutor<any>[];
	parallel?: boolean;
	stopOnError?: boolean;
}

class MultipleExecutor extends BaseExecutor<MultipleExecutorConfig> {

	execute = async () => {
		const {executors, parallel, stopOnError} = this.config;

		if ( ! executors ) {
			throw new Error("Executors are not defined");
		}

		if ( ! Array.isArray(executors) ) {
			throw new Error("Executors are not an array");
		}

		executors.forEach(( executor: unknown ) => {
			if ( executor instanceof BaseExecutor ) {
				return executor.prepare(this.task);
			}

			throw new Error("Executor must be an instance of BaseExecutor");
		});

		if ( parallel ) {
			const promises = executors.map(( executor ) => {
				return executor.execute();
			});

			if ( stopOnError ) {
				await Promise.all(promises);
			} else {
				await Promise.allSettled(promises);
			}
		} else {
			for ( const executor of executors ) {
				try {
					await executor.execute();
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
	MultipleExecutorConfig,
};

export default MultipleExecutor;