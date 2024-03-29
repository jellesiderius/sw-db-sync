"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// @ts-ignore
const settings_json_1 = tslib_1.__importDefault(require("../../config/settings.json"));
const node_ssh_1 = require("node-ssh");
const databasesModel_1 = tslib_1.__importDefault(require("../models/databasesModel"));
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const listr2_1 = require("listr2");
const command_exists_1 = tslib_1.__importDefault(require("command-exists"));
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
inquirer_1.default.registerPrompt("search-list", require("../../node_modules/inquirer-search-list"));
class MainController {
    constructor() {
        this.config = {
            'customConfig': {
                'sshKeyLocation': settings_json_1.default.ssh.keyLocation,
                'sshPassphrase': settings_json_1.default.ssh.passphrase,
                'localDatabaseFolderLocation': settings_json_1.default.general.databaseLocation
            },
            'serverVariables': {
                'externalPhpPath': '',
                'shopwareRoot': '',
                'databaseName': ''
            },
            'settings': {
                'currentFolder': '',
                'currentFolderName': '',
                'databaseFileName': '',
                'databaseFullPath': '',
                'strip': '',
                'syncImages': 'no',
                'rsyncInstalled': false,
                'import': 'no',
                'currentFolderIsShopware': false,
                'isDdevActive': false
            },
            'localhost': {
                'username': '',
                'password': '',
                'host': '',
                'port': '',
                'database': '',
                'domainUrl': '',
                'https': false
            },
            'finalMessages': {
                'shopwareDatabaseLocation': '',
                'importDomain': ''
            },
            'databases': {
                'databasesList': null,
                'databaseType': null,
                'databaseData': null
            }
        };
        this.list = new listr2_1.Listr([], { concurrent: false });
        this.ssh = new node_ssh_1.NodeSSH();
        this.databases = new databasesModel_1.default();
        this.configureConfig = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Fetch SSH key location, if non configured
            if (!this.config.customConfig.sshKeyLocation) {
                this.config.customConfig.sshKeyLocation = os.userInfo().homedir + '/.ssh/id_rsa';
            }
            // Check if rsync is installed locally
            yield (0, command_exists_1.default)('rsync')
                .then((command) => {
                this.config.settings.rsyncInstalled = true;
            }).catch(function () { });
            // Get current folder from cwd
            this.config.settings.currentFolder = process.cwd();
            // Set current folder name based on current folder
            this.config.settings.currentFolderName = path.basename(path.resolve(this.config.settings.currentFolder));
        });
        this.configureConfig().then();
    }
}
exports.default = MainController;
//# sourceMappingURL=mainController.js.map