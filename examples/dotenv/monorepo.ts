import { defineMonorepo, Runner } from "roserepo";

export default defineMonorepo({
	env: {
		monorepo: "check",
	},
	runner: {
		start: Runner.many({
			env: {
				runner: "check",
			},
		}),
	},
});