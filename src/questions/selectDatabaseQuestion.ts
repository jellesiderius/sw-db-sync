import { error } from "console";
import inquirer from 'inquirer'
import DatabasesModel from "../models/databasesModel";
import * as path from 'path'
import * as fs from 'fs'

class SelectDatabaseQuestion {
    private databasesModel = new DatabasesModel();
    private questions = [];

    configure = async (config: any) => {
        await this.addQuestions(config);

        await inquirer
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
            }
        })
        .catch((err: { message: any; }) => {
            error(`Something went wrong: ${err.message}`)
        });
    }

    // Add questions
    addQuestions = async (config: any) => {
        this.questions.push(
            {
                type: 'search-list',
                name: 'database',
                message: 'Select or search database',
                choices: config.databases.databasesList,
                validate: (input: string) => {
                    return input !== ''
                }
            }
        )
    }
}

export default SelectDatabaseQuestion
