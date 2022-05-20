import { clearConsole, info, success } from "../utils/console";
// @ts-ignore
import configFile from '../../config/settings.json'
import MainController from "./mainController";
import DatabaseTypeQuestion from "../questions/databaseTypeQuestion";
import SelectDatabaseQuestion from "../questions/selectDatabaseQuestion";
import ConfigurationQuestions from "../questions/configurationQuestions";
import ChecksTask from "../tasks/checksTask";
import DownloadTask from "../tasks/downloadTask";
import ImportTask from "../tasks/importTask";
import ShopwareConfigureTask from "../tasks/shopwareConfigureTask";

class StartController extends MainController {
    executeStart = async (): Promise<void> => {
        // Ask all the questions to the user
        await this.askQuestions();

        // Configure task list
        await this.prepareTasks();

        // Run all tasks
        try {
            await this.list.run();

            // Show final message when done with all tasks
            if (this.config.finalMessages.importDomain.length > 0) {
                success(`Shopware is successfully imported to localhost. ${this.config.finalMessages.importDomain} is now available.`);
                info(`You can log in to the Shopware backend with username: ${configFile.shopwareBackend.adminUsername} and password: ${configFile.shopwareBackend.adminPassword}`);
            } else if (this.config.finalMessages.shopwareDatabaseLocation.length > 0) {
                success(`Downloaded Shopware database to: ${this.config.finalMessages.shopwareDatabaseLocation}`);
                // Show wordpress download message if downloaded
                if (this.config.finalMessages.wordpressDatabaseLocation.length > 0 && this.config.settings.wordpressDownload && this.config.settings.wordpressDownload == 'yes' && this.config.settings.wordpressImport != 'yes') {
                    success(`Downloaded Wordpress database to: ${this.config.finalMessages.wordpressDatabaseLocation}`);
                }
            }

            // Show wordpress import message if imported
            if (this.config.settings.wordpressImport && this.config.settings.wordpressImport == 'yes') {
                success(`Wordpress is successfully imported to localhost.`);
                info(`You can log in to the Wordpress backend with username: ${configFile.shopwareBackend.adminEmailAddress} and password: ${configFile.shopwareBackend.adminPassword}`);
            }

            process.exit();
        } catch (e) {
            console.error(e)
        }
    }

    // Ask questions to user
    askQuestions = async () => {
        // Clear the console
        clearConsole();

        // Ask question about database type
        let databaseTypeQuestion = await new DatabaseTypeQuestion();
        await databaseTypeQuestion.configure(this.config);

        // Make user choose a database from the list
        let selectDatabaseQuestion = await new SelectDatabaseQuestion();
        await selectDatabaseQuestion.configure(this.config);

        // Adds multiple configuration questions
        let configurationQuestions = await new ConfigurationQuestions();
        await configurationQuestions.configure(this.config);

        // Clear the console
        clearConsole();
    }

    // Configure task list
    prepareTasks = async () => {
        // Build up check list
        let checkTask = await new ChecksTask();
        await checkTask.configure(this.list, this.config);

        // Build up download list
        let downloadTask = await new DownloadTask();
        await downloadTask.configure(this.list, this.config, this.ssh);

        // Import Shopware if possible
        if (this.config.settings.import && this.config.settings.import == "yes") {
            // Build import list
            let importTask = await new ImportTask();
            await importTask.configure(this.list, this.config);

            // Build Shopware configure list
            let shopwareConfigureTask = await new ShopwareConfigureTask();
            await shopwareConfigureTask.configure(this.list, this.config);
        }
    }
}

export default StartController
