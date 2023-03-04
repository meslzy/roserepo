import chalk from "chalk";

const colors = {
	default: chalk.hex("#ffffff"),
	//
	info: chalk.hex("#298e4c"),
	warn: chalk.hex("#ff9900"),
	error: chalk.hex("#ff0000"),
	debug: chalk.hex("#007eb9"),
	//
	roserepo: chalk.hex("#3d3d3d"),
	workspaces: [
		chalk.hex("#ff80bf"),
		chalk.hex("#ff80ff"),
		chalk.hex("#bf80ff"),
		chalk.hex("#8080ff"),
		chalk.hex("#80bfff"),
		chalk.hex("#80ffff"),
		chalk.hex("#80ffbf"),
		chalk.hex("#80ff80"),
		chalk.hex("#bfff80"),
		chalk.hex("#ffff80"),
		chalk.hex("#ffbf80"),
		chalk.hex("#ff8080"),
	],
};

const modifies = {
	default: chalk.reset,
	bold: chalk.bold,
	italic: chalk.italic,
	underline: chalk.underline,
	strikethrough: chalk.strikethrough,
	inverse: chalk.inverse,
	hidden: chalk.hidden,
	visible: chalk.visible,
};

const symbols = {
	default: "•",
	//
	success: "✔",
	warn: "⚠",
	error: "✖",
	//
	roserepo: "✤",
	workspaces: [
		"★",
		"✷",
	],
};

export {
	colors,
	modifies,
	symbols,
};