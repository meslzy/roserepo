import * as app1 from "app1";
import * as app2 from "app2";

const name = `app depends on (${app1.name}) and (${app2.name})`;

if ( require.main === module ) {
	console.log(name);
}

export {
	name,
};