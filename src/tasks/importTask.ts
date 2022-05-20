import {extractDatabaseDetails, localhostShopwareRootExec} from '../utils/console';
import { Listr } from 'listr2';

class ImportTask {
    private importTasks = [];

    configure = async (list: any, config: any) => {
        await this.addTasks(list, config);
        return list;
    }

    // Add tasks
    addTasks = async (list: any, config: any) => {
        list.add(
            {
                title: 'Import Shopware database to localhost',
                task: (ctx: any, task: any): Listr =>
                task.newListr(
                    this.importTasks
                )
            }
        )

        this.importTasks.push(
            {
                title: 'Getting database info',
                task: async (): Promise<void> => {
                    await localhostShopwareRootExec(`cat .env | grep "DATABASE_URL="`, config).then((result: any) => {
                        if (result) {
                            var databaseDetails = extractDatabaseDetails(result);

                            config.localhost.username = databaseDetails.username;
                            config.localhost.password = databaseDetails.password;
                            config.localhost.host = databaseDetails.host;
                            config.localhost.port = databaseDetails.port;
                            config.localhost.database = databaseDetails.database;
                        }
                    });
                }
            }
        );

        this.importTasks.push(
            {
                title: 'Importing database to localhost',
                task: async (): Promise<void> => {
                    // Drop database
                    await localhostShopwareRootExec(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} drop ${config.localhost.database} -f`, config, true);

                    // Create database
                    await localhostShopwareRootExec(`mysqladmin -u ${config.localhost.username} --password=${config.localhost.password} create ${config.localhost.database} -f`, config, true);

                    // Import database
                    await localhostShopwareRootExec(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} --force < ${config.settings.databaseFullPath}/${config.settings.databaseFileName}.sql`, config, true);
                }
            }
        );
    }
}

export default ImportTask
