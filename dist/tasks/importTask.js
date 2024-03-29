"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("../utils/console");
class ImportTask {
    constructor() {
        this.importTasks = [];
        this.configure = (list, config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addTasks(list, config);
            return list;
        });
        // Add tasks
        this.addTasks = (list, config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            list.add({
                title: 'Import Shopware database to localhost',
                task: (ctx, task) => task.newListr(this.importTasks)
            });
            this.importTasks.push({
                title: 'Getting localhost .env info',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield (0, console_1.localhostShopwareRootExec)(`cat .env | grep "DATABASE_URL="`, config).then((result) => {
                        if (result) {
                            var databaseDetails = (0, console_1.extractDatabaseDetails)(result);
                            config.localhost.username = databaseDetails.username;
                            config.localhost.password = databaseDetails.password;
                            config.localhost.host = databaseDetails.host;
                            config.localhost.port = databaseDetails.port;
                            config.localhost.database = databaseDetails.database;
                        }
                    });
                    yield (0, console_1.localhostShopwareRootExec)(`cat .env | grep "APP_URL="`, config).then((result) => {
                        if (result) {
                            var appUrl = result, splittedAppUrl = appUrl.split('//'), appUrlFromArray = splittedAppUrl[1].replace('"', '').trim();
                            config.localhost.domainUrl = appUrlFromArray;
                            // Determine http or https
                            if (appUrl.indexOf('https') !== -1) {
                                config.localhost.https = true;
                            }
                        }
                    });
                })
            });
            this.importTasks.push({
                title: 'Importing database to localhost',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Drop database
                    yield (0, console_1.localhostShopwareRootExec)(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} drop ${config.localhost.database} -f`, config, true);
                    // Create database
                    yield (0, console_1.localhostShopwareRootExec)(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} create ${config.localhost.database} -f`, config, true);
                    // Import database
                    yield (0, console_1.localhostShopwareRootExec)(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} --force < ${config.settings.databaseFullPath}/${config.settings.databaseFileName}.sql`, config, true);
                })
            });
            if (config.settings.syncImages == 'yes') {
                this.importTasks.push({
                    title: 'Synchronizing public/media & public/thumbnail',
                    task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        // Sync media
                        yield (0, console_1.localhostShopwareRootExec)(`rsync -avz -e "ssh -p ${config.databases.databaseData.port}" ${config.databases.databaseData.username}@${config.databases.databaseData.server}:${config.serverVariables.shopwareRoot}/public/media/* public/media/`, config, true, false, true);
                        // Sync thumbnail
                        yield (0, console_1.localhostShopwareRootExec)(`rsync -avz -e "ssh -p ${config.databases.databaseData.port}" ${config.databases.databaseData.username}@${config.databases.databaseData.server}:${config.serverVariables.shopwareRoot}/public/thumbnail/* public/thumbnail/`, config, true, false, true);
                    })
                });
            }
            this.importTasks.push({
                title: 'Cleaning up',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Remove local SQL file
                    yield (0, console_1.localhostShopwareRootExec)(`rm ${config.settings.databaseFileName}.sql`, config);
                })
            });
        });
    }
}
exports.default = ImportTask;
//# sourceMappingURL=importTask.js.map