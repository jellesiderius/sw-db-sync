"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const settings_json_1 = tslib_1.__importDefault(require("../../config/settings.json"));
class ChecksTask {
    constructor() {
        this.checkTasks = [];
        this.configure = (list, config, ssh) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addTasks(list, config, ssh);
            return list;
        });
        // Add tasks
        this.addTasks = (list, config, ssh) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            list.add({
                title: 'Running some checks',
                task: (ctx, task) => task.newListr(this.checkTasks)
            });
            if (config.settings.import && config.settings.import == 'yes') {
                // Check if all settings are filled in, if we import
                this.checkTasks.push({
                    title: 'Checking if config/settings.json is correctly filled',
                    task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        // Lets make sure everything is filled in
                        if (!settings_json_1.default.shopwareBackend.adminUsername || settings_json_1.default.shopwareBackend.adminUsername && settings_json_1.default.shopwareBackend.adminUsername.length == 0) {
                            throw new Error('Admin username is missing config/settings.json');
                        }
                        if (!settings_json_1.default.shopwareBackend.adminPassword || settings_json_1.default.shopwareBackend.adminPassword && settings_json_1.default.shopwareBackend.adminPassword.length == 0) {
                            throw new Error('Admin password is missing in config/settings.json');
                        }
                        if (!settings_json_1.default.shopwareBackend.adminEmailAddress || settings_json_1.default.shopwareBackend.adminEmailAddress && settings_json_1.default.shopwareBackend.adminEmailAddress.length == 0) {
                            throw new Error('Admin email address is missing in config/settings.json');
                        }
                    })
                });
                if (config.settings.import && config.settings.import == 'yes') {
                    // Check if target folder exists before downloading
                    this.checkTasks.push({
                        title: 'Checking if .env file exists',
                        task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            let envFileLocation = config.settings.currentFolder + '/.env';
                            if (fs.existsSync(envFileLocation)) {
                                return true;
                            }
                            throw new Error(`.env is missing, make sure ${envFileLocation} exists.`);
                        })
                    });
                }
            }
            // Check if target folder exists before downloading
            this.checkTasks.push({
                title: 'Checking if download folder exists',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (fs.existsSync(config.customConfig.localDatabaseFolderLocation)) {
                        return true;
                    }
                    throw new Error(`Download folder ${config.customConfig.localDatabaseFolderLocation} does not exist. This can be configured in config/settings.json`);
                })
            });
            // Check if SSH key exists
            this.checkTasks.push({
                title: 'Checking if SSH key exists',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (fs.existsSync(config.customConfig.sshKeyLocation)) {
                        return true;
                    }
                    throw new Error(`SSH key ${config.customConfig.sshKeyLocation} does not exist. This can be configured in config/settings.json`);
                })
            });
        });
    }
}
exports.default = ChecksTask;
//# sourceMappingURL=checksTask.js.map