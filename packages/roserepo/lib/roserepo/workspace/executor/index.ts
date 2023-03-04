import { BaseExecutorConfig } from "./base";

import ScriptExecutor, { ScriptExecutorConfig } from "./script";
import CommandExecutor, { CommandExecutorConfig } from "./command";
import NodeExecutor, { NodeExecutorConfig } from "./node";

import MultipleExecutor, { MultipleExecutorConfig } from "./multiple";

namespace Executor {
	export const script = ( config: BaseExecutorConfig<ScriptExecutorConfig> ) => {
		return new ScriptExecutor(config);
	};

	export const command = ( config: BaseExecutorConfig<CommandExecutorConfig> ) => {
		return new CommandExecutor(config);
	};

	export const node = ( config: BaseExecutorConfig<NodeExecutorConfig> ) => {
		return new NodeExecutor(config);
	};

	export const multiple = ( config: BaseExecutorConfig<MultipleExecutorConfig> ) => {
		return new MultipleExecutor(config);
	};
}

export default Executor;