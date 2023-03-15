"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("console");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const databasesModel_1 = tslib_1.__importDefault(require("../models/databasesModel"));
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const command_exists_1 = tslib_1.__importDefault(require("command-exists"));
class SelectDatabaseQuestion {
    constructor() {
        this.databasesModel = new databasesModel_1.default();
        this.questions = [];
        this.configure = (config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addQuestions(config);
            yield inquirer_1.default
                .prompt(this.questions)
                .then((answers) => {
                // Get database key to get database settings
                let keyRegex = /\((.*)\)/i;
                let selectedDatabase = answers.database;
                let databaseKey = selectedDatabase.match(keyRegex)[1];
                // Collects database data based on key
                this.databasesModel.collectDatabaseData(databaseKey, config.databases.databaseType);
                // Set database data in config
                config.databases.databaseData = this.databasesModel.databaseData;
                // If local folder is set for project, use that as currentFolder
                config.settings.currentFolder = process.cwd();
                if (config.databases.databaseData.localProjectFolder && config.databases.databaseData.localProjectFolder.length > 0) {
                    config.settings.currentFolder = config.databases.databaseData.localProjectFolder;
                }
                // Set current folder name based on current folder
                config.settings.currentFolderName = path.basename(path.resolve(config.settings.currentFolder));
                // Check if current is shopware. This will be used to determine if we can import Shopware
                if (fs.existsSync(config.settings.currentFolder + '/vendor/shopware/core') || fs.existsSync(config.settings.currentFolder + '/public/index.php')) {
                    config.settings.currentFolderIsShopware = true;
                    if (fs.existsSync(config.settings.currentFolder + '/.ddev/config.yaml')) {
                        // Check if ddev is installed locally
                        (0, command_exists_1.default)('ddev').then((command) => {
                            config.settings.isDdevActive = true;
                        }).catch(function () { });
                    }
                }
            })
                .catch((err) => {
                (0, console_1.error)(`Something went wrong: ${err.message}`);
            });
        });
        // Add questions
        this.addQuestions = (config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.questions.push({
                type: 'search-list',
                name: 'database',
                message: 'Select or search database',
                choices: config.databases.databasesList,
                validate: (input) => {
                    return input !== '';
                }
            });
        });
    }
}
exports.default = SelectDatabaseQuestion;
//# sourceMappingURL=selectDatabaseQuestion.js.map