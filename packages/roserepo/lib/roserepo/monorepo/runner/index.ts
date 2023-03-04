import { BaseRunnerConfig } from "./base";

import ManyRunner, { ManyRunnerConfig } from "./many";
import PipelineRunner, { PipelineRunnerConfig } from "./pipeline";

import RootRunner, { RootRunnerConfig } from "./root";

import MultipleRunner, { MultipleRunnerConfig } from "./multiple";

namespace Runner {
	export const many = ( config: BaseRunnerConfig<ManyRunnerConfig> ) => {
		return new ManyRunner(config);
	};

	export const pipeline = ( config: BaseRunnerConfig<PipelineRunnerConfig> ) => {
		return new PipelineRunner(config);
	};

	export const root = ( config: BaseRunnerConfig<RootRunnerConfig> ) => {
		return new RootRunner(config);
	};

	export const multiple = ( config: BaseRunnerConfig<MultipleRunnerConfig> ) => {
		return new MultipleRunner(config);
	};
}

export default Runner;