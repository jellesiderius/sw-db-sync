"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("../utils/console");
// @ts-ignore
class DownloadTask {
    constructor() {
        this.downloadTasks = [];
        this.configure = (list, config, ssh) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addTasks(list, config, ssh);
            return list;
        });
        // Add tasks
        this.addTasks = (list, config, ssh) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            list.add({
                title: 'Download database from server ' + '(' + config.databases.databaseData.username + ')',
                task: (ctx, task) => task.newListr(this.downloadTasks)
            });
            this.downloadTasks.push({
                title: 'Connecting to server through SSH',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Open connection to SSH server
                    yield ssh.connect({
                        host: config.databases.databaseData.server,
                        password: config.databases.databaseData.password,
                        username: config.databases.databaseData.username,
                        port: config.databases.databaseData.port,
                        privateKey: config.customConfig.sshKeyLocation,
                        passphrase: config.customConfig.sshPassphrase
                    });
                })
            });
            this.downloadTasks.push({
                title: 'Retrieving server settings',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Retrieve settings from server to use
                    yield ssh.execCommand((0, console_1.sshNavigateToShopwareRootCommand)('pwd; which php;', config)).then((result) => {
                        if (result) {
                            let serverValues = result.stdout.split("\n");
                            config.serverVariables.shopwareRoot = serverValues[0];
                            // Get PHP path
                            config.serverVariables.externalPhpPath = serverValues[1];
                        }
                    });
                    // Use custom PHP path instead if given
                    if (config.databases.databaseData.externalPhpPath && config.databases.databaseData.externalPhpPath.length > 0) {
                        config.serverVariables.externalPhpPath = config.databases.databaseData.externalPhpPath;
                    }
                })
            });
            this.downloadTasks.push({
                title: 'Downloading Shopware6 DB Dump File to server',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield ssh.execCommand((0, console_1.sshNavigateToShopwareRootCommand)('curl -O https://raw.githubusercontent.com/jellesiderius/shopware6-database-dump/main/shopware6-database-dump.sh', config));
                })
            });
            this.downloadTasks.push({
                title: 'Dumping Shopware database and moving it to server root (' + config.settings.strip + ')',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    var username = '', password = '', host = '', port = '', database = '';
                    // Retrieve database name
                    yield ssh.execCommand((0, console_1.sshNavigateToShopwareRootCommand)('cat .env | grep "DATABASE_URL="', config)).then((result) => {
                        if (result) {
                            var resultValues = result.stdout, databaseDetails = (0, console_1.extractDatabaseDetails)(resultValues);
                            username = databaseDetails.username;
                            password = databaseDetails.password;
                            host = databaseDetails.host;
                            port = databaseDetails.port;
                            database = databaseDetails.database;
                            config.settings.databaseFileName = database;
                        }
                    });
                    // Dump database
                    var dumpCommand = `/bin/bash shopware6-database-dump.sh -d ${database} -u ${username} -pa ${password} --host ${host} -p ${port} --gdpr`;
                    if (config.settings.strip == 'full') {
                        dumpCommand = `/bin/bash shopware6-database-dump.sh -d ${database} -u ${username} -pa ${password} --host ${host} -p ${port}`;
                    }
                    yield ssh.execCommand((0, console_1.sshNavigateToShopwareRootCommand)(`${dumpCommand}; mv ${config.settings.databaseFileName}.sql ~`, config));
                })
            });
            this.downloadTasks.push({
                title: 'Downloading Shopware 6 database to localhost',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Download file and place it on localhost
                    let localDatabaseFolderLocation = config.customConfig.localDatabaseFolderLocation;
                    let localDatabaseLocation = localDatabaseFolderLocation + `/${config.settings.databaseFileName}.sql`;
                    if (config.settings.rsyncInstalled) {
                        yield (0, console_1.localhostRsyncDownloadCommand)(`~/${config.settings.databaseFileName}.sql`, `${localDatabaseFolderLocation}`, config);
                    }
                    else {
                        yield ssh.getFile(localDatabaseLocation, config.settings.databaseFileName + '.sql').then(function (Contents) {
                        }, function (error) {
                            throw new Error(error);
                        });
                    }
                    // Set final message with Shopware 6 DB location
                    config.finalMessages.shopwareDatabaseLocation = localDatabaseLocation;
                    config.settings.databaseFullPath = localDatabaseFolderLocation;
                })
            });
            this.downloadTasks.push({
                title: 'Cleaning up and closing SSH connection',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Remove the Shopware 6 database file on the server
                    yield ssh.execCommand(`rm ${config.settings.databaseFileName}.sql`);
                    // Remove database dump file and close connection to SSH
                    yield ssh.execCommand((0, console_1.sshNavigateToShopwareRootCommand)('rm shopware6-database-dump.sh', config));
                    // Close the SSH connection
                    yield ssh.dispose();
                })
            });
        });
    }
}
exports.default = DownloadTask;
//# sourceMappingURL=downloadTask.js.map