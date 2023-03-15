"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("../utils/console");
const settings_json_1 = tslib_1.__importDefault(require("../../config/settings.json"));
class ShopwareConfigureTask {
    constructor() {
        this.configureTasks = [];
        this.configure = (list, config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addTasks(list, config);
            return list;
        });
        // Add tasks
        this.addTasks = (list, config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            list.add({
                title: 'Configuring Shopware 6 for development usage',
                task: (ctx, task) => task.newListr(this.configureTasks)
            });
            this.configureTasks.push({
                title: "Setting URL for sales channels",
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console sales-channel:update:domain ${config.localhost.domainUrl}`, config);
                    if (config.localhost.https) {
                        yield (0, console_1.localhostShopwareRootMysqlExec)("UPDATE sales_channel_domain SET url = REPLACE(url,'http://', 'https://')", config);
                        config.finalMessages.importDomain = `https://${config.localhost.domainUrl}`;
                    }
                    else {
                        yield (0, console_1.localhostShopwareRootMysqlExec)("UPDATE sales_channel_domain SET url = REPLACE(url,'https://', 'http://')", config);
                        config.finalMessages.importDomain = `http://${config.localhost.domainUrl}`;
                    }
                })
            });
            if (config.settings.syncImages == 'no') {
                this.configureTasks.push({
                    title: "Emptying media tables",
                    task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        // Product media
                        yield (0, console_1.localhostShopwareRootMysqlExec)('TRUNCATE TABLE product_media', config);
                        // Theme media
                        yield (0, console_1.localhostShopwareRootMysqlExec)('TRUNCATE TABLE theme_media', config);
                    })
                });
            }
            this.configureTasks.push({
                title: "Refreshing plugins",
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console plugin:refresh`, config);
                })
            });
            this.configureTasks.push({
                title: "Compiling theme",
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console theme:compile`, config);
                })
            });
            this.configureTasks.push({
                title: 'Creating a admin user',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console user:create -a ${settings_json_1.default.shopwareBackend.adminUsername} -p ${settings_json_1.default.shopwareBackend.adminPassword} --email ${settings_json_1.default.shopwareBackend.adminEmailAddress}`, config);
                })
            });
            this.configureTasks.push({
                title: 'Reindexing Shopware (ES)',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Reindex
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console es:index -n`, config);
                    // Reset indexes
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console es:reset -n`, config);
                })
            });
            this.configureTasks.push({
                title: 'Flushing Shopware 6 caches',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Flush the shopware caches and import config data
                    yield (0, console_1.localhostShopwareRootExec)(`bin/console cache:clear`, config);
                })
            });
        });
    }
}
exports.default = ShopwareConfigureTask;
//# sourceMappingURL=shopwareConfigureTask.js.map