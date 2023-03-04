import { defineMonorepo, Runner } from "roserepo";

export default defineMonorepo({
	runner: {
		start: Runner.pipeline({
			parallel: true,
			selfScripts: [
				"test",
			],
		}),
		test: Runner.pipeline({
			parallel: true,
			throwOnError: true,
			selfScripts: [
				"build",
			],
		}),
		build: Runner.pipeline({
			parallel: true,
			throwOnError: true,
			dependencyScripts: [
				"build",
			],
			workspaceScripts: [
				{
					directoryPattern: "packages",
					script: "build",
				},
			],
		}),
		lint: Runner.many({
			parallel: true,
		}),
	},
});