import { defineWorkspace, Executor } from "roserepo";

export default defineWorkspace({
	env: {
		workspace: "check",
	},
	executor: {
		start: Executor.node({
			env: {
				executor: "check",
			},
			file: "source/index.js",
		}),
	},
});