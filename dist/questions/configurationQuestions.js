"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const console_1 = require("console");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
class ConfigurationQuestions {
    constructor() {
        this.questionsOne = [];
        this.questionsTwo = [];
        this.configure = (config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.addQuestions(config);
            // Set import configs
            yield inquirer_1.default
                .prompt(this.questionsOne)
                .then((answers) => {
                // Set stripped setting
                config.settings.strip = answers.strip;
                // Set import setting for Shopware
                config.settings.import = answers.import;
                // Set image import setting for Shopware
                config.settings.syncImages = answers.syncImages;
                // Change location of database download depending on answer
                if (config.settings.import == 'yes') {
                    config.customConfig.localDatabaseFolderLocation = config.settings.currentFolder;
                }
            })
                .catch((err) => {
                (0, console_1.error)(`Something went wrong: ${err.message}`);
            });
        });
        // Add questions
        this.addQuestions = (config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.questionsOne.push({
                type: 'list',
                name: 'strip',
                default: 'stripped',
                message: 'Does the Shopware database need to be stripped for development?',
                choices: ['stripped', 'full'],
                validate: (input) => {
                    return input !== '';
                }
            });
            // Only push questions if Shopware project is found
            if (config.settings.currentFolderIsShopware) {
                this.questionsOne.push({
                    type: 'list',
                    name: 'import',
                    default: 'yes',
                    message: 'Import Shopware database?',
                    choices: ['yes', 'no'],
                    validate: (input) => {
                        return false;
                    },
                });
                if (config.settings.rsyncInstalled) {
                    this.questionsOne.push({
                        type: 'list',
                        name: 'syncImages',
                        default: 'yes',
                        message: 'Synchronize images from public/media?',
                        choices: ['yes', 'no'],
                        validate: (input) => {
                            return false;
                        },
                    });
                }
            }
        });
    }
}
exports.default = ConfigurationQuestions;
//# sourceMappingURL=configurationQuestions.js.map