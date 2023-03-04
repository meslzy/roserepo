import path from "node:path";

const normalizePath = ( location: string ) => {
	if ( path.sep === "/" ) return location;
	return location.replace(/\\/g, "/");
};

export {
	normalizePath,
};