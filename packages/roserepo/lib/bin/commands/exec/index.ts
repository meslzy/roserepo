import { createCommand } from "commander";

import { logger } from "~shared/logger";

const exec = createCommand("exec");

exec.description("Run script in the workspace");

exec.argument("<script>", "Script to execute in the workspace");

exec.action(async ( script: string ) => {
	try {
	} catch ( error: unknown ) {
		logger.error(error, {
			lineBefore: true,
			exitCode: 1,
			exit: true,
		});
	}
});

export default exec;