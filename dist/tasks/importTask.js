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
                title: 'Getting database info',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield console_1.localhostShopwareRootExec(`cat .env | grep "DATABASE_URL="`, config).then((result) => {
                        if (result) {
                            var databaseDetails = console_1.extractDatabaseDetails(result);
                            config.localhost.username = databaseDetails.username;
                            config.localhost.password = databaseDetails.password;
                            config.localhost.host = databaseDetails.host;
                            config.localhost.port = databaseDetails.port;
                            config.localhost.database = databaseDetails.database;
                        }
                    });
                })
            });
            this.importTasks.push({
                title: 'Importing database to localhost',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Drop database
                    yield console_1.localhostShopwareRootExec(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} drop ${config.localhost.database} -f`, config, true);
                    // Create database
                    yield console_1.localhostShopwareRootExec(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} create ${config.localhost.database} -f`, config, true);
                    // Import database
                    yield console_1.localhostShopwareRootExec(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} --force < ${config.settings.databaseFullPath}/${config.settings.databaseFileName}.sql`, config, true);
                })
            });
        });
    }
}
exports.default = ImportTask;
//# sourceMappingURL=importTask.js.map