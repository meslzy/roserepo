import { defineMonorepo, Runner, Cache } from "roserepo";

export default defineMonorepo({
	runner: {
		dev: Runner.many({
			parallel: true,
			restartOnError: true,
		}),
		build: Runner.pipeline({
			parallel: true,
			throwOnError: true,
			workspaceScripts: [
				{
					pattern: /^roserepo/,
					by: "name",
				},
			],
			cache: Cache.files({
				pattern: [
					"lib",
					"source",
					"tsup.config.ts",
				],
			}),
		}),
		lint: Runner.many({
			parallel: true,
			include: [
				{
					pattern: /^packages/,
					by: "directory",
				}, {
					pattern: /^shared/,
					by: "directory",
				},
			],
			cache: Cache.files({
				pattern: [
					"lib",
					"source",
					"tsup.config.ts",
					"{monorepoDir}/utils",
				],
			}),
		}),
	},
	exclude: [
		{
			pattern: /^shared/,
			by: "directory",
		}, {
			pattern: /^utils/,
			by: "directory",
		},
	],
});