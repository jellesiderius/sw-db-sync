"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("../utils/console");
// @ts-ignore
const settings_json_1 = tslib_1.__importDefault(require("../../config/settings.json"));
const mainController_1 = tslib_1.__importDefault(require("./mainController"));
const databaseTypeQuestion_1 = tslib_1.__importDefault(require("../questions/databaseTypeQuestion"));
const selectDatabaseQuestion_1 = tslib_1.__importDefault(require("../questions/selectDatabaseQuestion"));
const configurationQuestions_1 = tslib_1.__importDefault(require("../questions/configurationQuestions"));
const checksTask_1 = tslib_1.__importDefault(require("../tasks/checksTask"));
const downloadTask_1 = tslib_1.__importDefault(require("../tasks/downloadTask"));
const importTask_1 = tslib_1.__importDefault(require("../tasks/importTask"));
const shopwareConfigureTask_1 = tslib_1.__importDefault(require("../tasks/shopwareConfigureTask"));
class StartController extends mainController_1.default {
    constructor() {
        super(...arguments);
        this.executeStart = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Ask all the questions to the user
            yield this.askQuestions();
            // Configure task list
            yield this.prepareTasks();
            // Run all tasks
            try {
                yield this.list.run();
                // Show final message when done with all tasks
                if (this.config.finalMessages.importDomain.length > 0) {
                    (0, console_1.success)(`Shopware is successfully imported to localhost. ${this.config.finalMessages.importDomain} is now available.`);
                    (0, console_1.info)(`You can log in to the Shopware backend with username: ${settings_json_1.default.shopwareBackend.adminUsername} and password: ${settings_json_1.default.shopwareBackend.adminPassword}`);
                }
                else if (this.config.finalMessages.shopwareDatabaseLocation.length > 0) {
                    (0, console_1.success)(`Downloaded Shopware database to: ${this.config.finalMessages.shopwareDatabaseLocation}`);
                }
                process.exit();
            }
            catch (e) {
                console.error(e);
            }
        });
        // Ask questions to user
        this.askQuestions = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Clear the console
            (0, console_1.clearConsole)();
            // Ask question about database type
            let databaseTypeQuestion = yield new databaseTypeQuestion_1.default();
            yield databaseTypeQuestion.configure(this.config);
            // Make user choose a database from the list
            let selectDatabaseQuestion = yield new selectDatabaseQuestion_1.default();
            yield selectDatabaseQuestion.configure(this.config);
            // Adds multiple configuration questions
            let configurationQuestions = yield new configurationQuestions_1.default();
            yield configurationQuestions.configure(this.config);
            // Clear the console
            (0, console_1.clearConsole)();
        });
        // Configure task list
        this.prepareTasks = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Build up check list
            let checkTask = yield new checksTask_1.default();
            yield checkTask.configure(this.list, this.config);
            // Build up download list
            let downloadTask = yield new downloadTask_1.default();
            yield downloadTask.configure(this.list, this.config, this.ssh);
            // Import Shopware if possible
            if (this.config.settings.import && this.config.settings.import == "yes") {
                // Build import list
                let importTask = yield new importTask_1.default();
                yield importTask.configure(this.list, this.config);
                // Build Shopware configure list
                let shopwareConfigureTask = yield new shopwareConfigureTask_1.default();
                yield shopwareConfigureTask.configure(this.list, this.config);
            }
        });
    }
}
exports.default = StartController;
//# sourceMappingURL=startController.js.map