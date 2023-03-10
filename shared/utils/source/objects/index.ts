const deepMerge = <Type>( ...objects: any[] ): Type => {
	const isObject = ( obj: any ) => obj && typeof obj === "object";

	return objects.reduce(( prev: any, obj: any ) => {
		Object.keys(obj).forEach(( key ) => {
			const pVal = prev[ key ];
			const oVal = obj[ key ];

			if ( Array.isArray(pVal) && Array.isArray(oVal) ) {
				prev[ key ] = pVal.concat(...oVal);
			} else if ( isObject(pVal) && isObject(oVal) ) {
				prev[ key ] = deepMerge(pVal, oVal);
			} else {
				prev[ key ] = oVal;
			}
		});

		return prev;
	}, {});
};

export {
	deepMerge,
};