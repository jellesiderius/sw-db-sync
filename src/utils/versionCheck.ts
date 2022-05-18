// @ts-ignore
import packageFile from "../../package.json";
// @ts-ignore
import * as fetch from 'node-fetch'

class VersionCheck {
	public config = {
		'latestVersion': '',
		'currentVersion': packageFile.version
	}

	// versions
	getToolVersions = async () => {
		await fetch('https://raw.githubusercontent.com/jellesiderius/sw-db-sync/master/package.json?token=GHSAT0AAAAAABNRNLDIK4GBEJDNTR6XTTOMYUEYY4A')
			.then((res: { json: () => any; }) => res.json())
			.then((json: { version: string; }) => this.config.latestVersion = json.version);
	}
}

export default VersionCheck;
