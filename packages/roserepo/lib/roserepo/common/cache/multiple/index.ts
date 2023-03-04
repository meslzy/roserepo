import BaseCache from "~roserepo/common/cache/base";
import Task from "~roserepo/common/task";

interface MultipleCacheConfig {
	caches: BaseCache<unknown>[];
}

class MultipleCache extends BaseCache<MultipleCacheConfig> {
	hash = async () => {
		const promises = this.config.caches.map(( cache ) => {
			return cache.hash();
		});

		const results = [];

		for ( const promise of promises ) {
			results.push(await promise);
		}

		return this.createHash(results);
	};

	getClonesCaches(): BaseCache<unknown>[] {
		return (this.config.caches || []).map(( cache ) => {
			if ( (cache as any) instanceof BaseCache ) {
				return cache.clone();
			}

			throw new Error(`Cache ${cache} is not a BaseCache, but a ${typeof cache}`);
		});
	}

	clone(): BaseCache<unknown> {
		return new MultipleCache({
			caches: this.getClonesCaches(),
		});
	}

	prepare( task: Task ) {
		super.prepare(task);

		this.config.caches = this.getClonesCaches();

		for ( const cache of this.config.caches ) {
			cache.prepare(task);
		}
	}
}

export type {
	MultipleCacheConfig,
};

export default MultipleCache;