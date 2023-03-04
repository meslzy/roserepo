import { createCommand } from "commander";

import { logger } from "~shared/logger";

import roserepo from "~/roserepo";

const run = createCommand("run");

run.description("Run script in the monorepo");

run.argument("<script>", "Script to run in the monorepo");

run.action(async ( script: string ) => {
	try {
		await roserepo.initializeMonorepo();

		if ( roserepo.monorepo.location !== process.cwd() ) {
			return logger.error("Running scripts in workspaces is not supported yet", {
				exit: true,
			});
		}

		await roserepo.initializeWorkspaces();

		logger.info(`Found ${roserepo.workspaces.length} workspaces`);
		const workspaceNames = roserepo.workspaces.map(( workspace ) => {
			return workspace.packageJson.name;
		});

		if ( workspaceNames.length > 5 ) {
			logger.info(`Workspaces: ${workspaceNames.slice(0, 5).join(", ")}, and ${workspaceNames.length - 5} more...`, {
				lineAfter: true,
			});
		} else {
			logger.info(`Workspaces: ${workspaceNames.join(", ")}`, {
				lineAfter: true,
			});
		}

		const start = process.hrtime();
		await roserepo.run(script);
		const end = process.hrtime(start);

		end[ 1 ] = Math.round(end[ 1 ] / 1000000);
		logger.info(`Completed in ${end[ 0 ]}s ${end[ 1 ]}ms`, {
			lineBefore: true,
			lineAfter: true,
		});
	} catch ( error: unknown ) {
		logger.error(error, {
			exit: true,
			exitCode: 1,
			lineBefore: true,
		});
	}
});

export default run;