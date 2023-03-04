interface WorkspaceFilter {
	pattern: string | RegExp;
	by?: "name" | "directory";
}

export {
	WorkspaceFilter,
};