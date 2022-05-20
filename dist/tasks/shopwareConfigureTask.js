"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("../utils/console");
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
                    yield console_1.localhostShopwareRootExec(`bin/console sales-channel:update:domain shopware-test.development`, config);
                    // @TODO: Replace https to http & replace static domain
                })
            });
            this.configureTasks.push({
                title: "Compiling theme",
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield console_1.localhostShopwareRootExec(`bin/console theme:compile`, config);
                })
            });
            this.configureTasks.push({
                title: 'Creating a admin user',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    //
                })
            });
            this.configureTasks.push({
                title: 'Creating a dummy customer on every website',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    //
                })
            });
            this.configureTasks.push({
                title: "Configuring Wordpress settings within Magento",
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    //
                })
            });
            this.configureTasks.push({
                title: 'Reindexing Magento',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Reindex data, only when elastic is used
                })
            });
            this.configureTasks.push({
                title: 'Flushing Shopware 6 caches',
                task: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // Flush the magento caches and import config data
                    yield console_1.localhostShopwareRootExec(`bin/console cache:clear`, config);
                })
            });
        });
    }
}
exports.default = ShopwareConfigureTask;
//# sourceMappingURL=shopwareConfigureTask.js.map