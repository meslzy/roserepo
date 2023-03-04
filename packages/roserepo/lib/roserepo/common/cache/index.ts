import { BaseCacheConfig } from "./base";

import FilesCache, { FilesCacheConfig } from "./files";
import MultipleCache, { MultipleCacheConfig } from "./multiple";

namespace Cache {
	export const files = ( cacheConfig: BaseCacheConfig<FilesCacheConfig> ) => {
		return new FilesCache(cacheConfig);
	};

	export const multiple = ( cacheConfig: BaseCacheConfig<MultipleCacheConfig> ) => {
		return new MultipleCache(cacheConfig);
	};
}

export default Cache;