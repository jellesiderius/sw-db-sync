import {localhostRsyncDownloadCommand, sshShopwareRootFolderMagerunCommand, sshNavigateToShopwareRootCommand, extractDatabaseDetails } from '../utils/console';
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
                    await ssh.execCommand(sshNavigateToShopwareRootCommand('pwd; which php;', config)).then((result: any) => {
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

        this.downloadTasks.push(
            {
                title: 'Downloading Shopware6 DB Dump File to server',
                task: async (): Promise<void> => {
                    // Download Magerun to the server
                    await ssh.execCommand(sshNavigateToShopwareRootCommand('curl -O https://raw.githubusercontent.com/jellesiderius/shopware6-database-dump/main/shopware6-database-dump.sh', config));
                }
            },
        );

        this.downloadTasks.push(
            {
                title: 'Dumping Shopware database and moving it to server root (' + config.settings.strip + ')',
                task: async (): Promise<void> => {
                    var username = '',
                        password = '',
                        host = '',
                        port = '',
                        database = '';

                    // Retrieve database name
                    await ssh.execCommand(sshNavigateToShopwareRootCommand('cat .env | grep "DATABASE_URL="', config)).then((result: any) => {
                        if (result) {
                            var resultValues = result.stdout,
                                databaseDetails = extractDatabaseDetails(resultValues);

                            username = databaseDetails.username;
                            password = databaseDetails.password;
                            host = databaseDetails.host;
                            port = databaseDetails.port;
                            database = databaseDetails.database;

                            config.settings.databaseFileName = database;
                        }
                    });

                    // Dump database, database name will be "shopware6-database-dump.sql"
                    var dumpCommand = `sh shopware6-database-dump.sh -d ${database} -u ${username} -pa ${password} --host ${host} -p ${port}; mv ${config.settings.databaseFileName}.sql ~`;
                    await ssh.execCommand(sshNavigateToShopwareRootCommand(dumpCommand, config));
                }
            }
        );

        this.downloadTasks.push(
            {
                title: 'Downloading Shopware 6 database to localhost',
                task: async (): Promise<void> => {
                    // Download file and place it on localhost
                    let localDatabaseFolderLocation = config.customConfig.localDatabaseFolderLocation;
                    let localDatabaseLocation = localDatabaseFolderLocation + `/${config.settings.databaseFileName}.sql`;

                    if (config.settings.rsyncInstalled) {
                        await localhostRsyncDownloadCommand(`~/${config.settings.databaseFileName}.sql`, `${localDatabaseFolderLocation}`, config);
                    } else {
                        await ssh.getFile(localDatabaseLocation, config.settings.databaseFileName + '.sql').then(function (Contents: any) {
                        }, function (error: any) {
                            throw new Error(error)
                        });
                    }

                    // Set final message with Shopware 6 DB location
                    config.finalMessages.magentoDatabaseLocation = localDatabaseLocation;
                    config.settings.databaseFullPath = localDatabaseFolderLocation;
                }
            }
        );

        this.downloadTasks.push(
            {
                title: 'Cleaning up and closing SSH connection',
                task: async (): Promise<void> => {
                    // Remove the Shopware 6 database file on the server
                    await ssh.execCommand(`rm ${config.settings.databaseFileName}.sql`);

                    // Remove database dump file and close connection to SSH
                    await ssh.execCommand(sshNavigateToShopwareRootCommand('rm shopware6-database-dump.sh', config));

                    // Close the SSH connection
                    await ssh.dispose();
                }
            }
        );
    }
}

export default DownloadTask
