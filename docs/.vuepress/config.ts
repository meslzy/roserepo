import { defaultTheme, defineUserConfig, NavbarConfig } from "vuepress";

import { externalLinkIconPlugin } from "@vuepress/plugin-external-link-icon";
import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics";
import { backToTopPlugin } from "@vuepress/plugin-back-to-top";
import { nprogressPlugin } from "@vuepress/plugin-nprogress";
import { prismjsPlugin } from "@vuepress/plugin-prismjs";
import { searchPlugin } from "@vuepress/plugin-search";

const navbar: NavbarConfig = [
	{
		text: "Guide",
		link: "/guide/",
		activeMatch: "^/guide/",
		children: [
			{
				text: "Getting started",
				link: "/guide/getting-started",
			},
		],
	},
	{
		text: "Reference",
		link: "/reference/",
		activeMatch: "^/reference/",
		children: [
			{
				text: "Monorepo Config",
				link: "/reference/config/monorepo",
			}, {
				text: "Workspace Config",
				link: "/reference/config/workspace",
			},
		],
	},
	{
		text: "Runner",
		link: "/runner/",
		activeMatch: "^/runner/",
		children: [
			{
				text: "Many",
				link: "/runner/many",
			}, {
				text: "Pipeline",
				link: "/runner/pipeline",
			}, {
				text: "Base",
				link: "/runner/base",
			},
			{
				text: "External",
				children: [
					{
						text: "Electron",
						link: "/runner/external/electron",
					},
				],
			},
		],
	},
	{
		text: "Executor",
		link: "/executor/",
		children: [
			{
				text: "Script",
				link: "/executor/script",
			}, {
				text: "Command",
				link: "/executor/command",
			}, {
				text: "Multiple",
				link: "/executor/multiple",
			}, {
				text: "Bundler",
				link: "/executor/bundler",
			}, {
				text: "Node",
				link: "/executor/node",
			}, {
				text: "Base",
				link: "/executor/base",
			}, {
				text: "External",
				children: [
					{
						text: "Vite",
						link: "/executor/external/vite",
					},
				],
			},
		],
	},
];

export default defineUserConfig({
	title: "Roserepo",
	description: "Astonishing tools for managing monorepo",
	theme: defaultTheme({
		logo: "images/logo.svg",
		//
		colorMode: "dark",
		colorModeSwitch: false,
		//
		repo: "meslzy/roserepo",
		editLinkText: "Suggest changes to this page",
		//
		docsRepo: "https://github.com/meslzy/roserepo",
		docsBranch: "main",
		docsDir: "docs",
		editLinkPattern: ":repo/edit/:branch/:path",
		//
		navbar,
	}),
	plugins: [
		externalLinkIconPlugin(),
		googleAnalyticsPlugin({
			id: "G-GXQL309FV9",
		}),
		backToTopPlugin(),
		nprogressPlugin(),
		prismjsPlugin({
			preloadLanguages: [
				"markdown",
				"bash",
				"json",
				"typescript",
				"javascript",
			],
		}),
		searchPlugin(),
	],
});