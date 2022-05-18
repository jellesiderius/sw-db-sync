import {localhostRsyncDownloadCommand, sshMagentoRootFolderMagerunCommand, sshNavigateToMagentoRootCommand, wordpressReplaces } from '../utils/console';
import { Listr } from 'listr2';
// @ts-ignore
import staticConfigFile from '../../config/static-settings.json'
import configFile from "../../config/settings.json";

class DownloadTask {
    private downloadTasks = [];

    configure = async (list: any, config: any, ssh: any) => {
        await this.addTasks(list, config, ssh);
        return list;
    }

    // Add tasks
    addTasks = async (list: any, config: any, ssh: any) => {
        list.add(
            {
                title: 'Download database from server ' + '(' + config.databases.databaseData.username + ')',
                task: (ctx: any, task: any): Listr =>
                task.newListr(
                    this.downloadTasks
                )
            }
        )

        this.downloadTasks.push(
            {
                title: 'Connecting to server through SSH',
                task: async (): Promise<void> => {
                    // Open connection to SSH server
                    await ssh.connect({
                        host: config.databases.databaseData.server,
                        password: config.databases.databaseData.password,
                        username: config.databases.databaseData.username,
                        port: config.databases.databaseData.port,
                        privateKey: config.customConfig.sshKeyLocation,
                        passphrase: config.customConfig.sshPassphrase
                    });
                }
            }
        );

        this.downloadTasks.push(
            {
                title: 'Retrieving server settings',
                task: async (): Promise<void> => {
                    // Retrieve settings from server to use
                    await ssh.execCommand(sshNavigateToMagentoRootCommand('pwd; which php;', config)).then((result: any) => {
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
                }
            }
        );
    }
}

export default DownloadTask
