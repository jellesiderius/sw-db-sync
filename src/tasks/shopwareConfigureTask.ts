import {localhostShopwareRootExec} from '../utils/console';
import { Listr } from 'listr2';
import configFile from '../../config/settings.json'

class ShopwareConfigureTask {
    private configureTasks = [];

    configure = async (list: any, config: any) => {
        await this.addTasks(list, config);
        return list;
    }

    // Add tasks
    addTasks = async (list: any, config: any) => {
        list.add(
            {
                title: 'Configuring Shopware 6 for development usage',
                task: (ctx: any, task: any): Listr =>
                task.newListr(
                    this.configureTasks
                )
            }
        )

        this.configureTasks.push(
            {
                title: "Setting URL for sales channels",
                task: async (): Promise<void> => {
                    await localhostShopwareRootExec(`bin/console sales-channel:update:domain ${config.settings.shopwareLocalhostDomainName}`, config);
                    await localhostShopwareRootExec(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} -e "UPDATE sales_channel_domain SET url = REPLACE(url,'https://', 'http://');"`, config);

                    config.finalMessages.importDomain = `http://${config.settings.shopwareLocalhostDomainName}`;
                }
            }
        );

        this.configureTasks.push(
            {
                title: "Emptying media tables",
                task: async (): Promise<void> => {
                    // Product media
                    await localhostShopwareRootExec(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} -e "TRUNCATE TABLE product_media"`, config);

                    // Theme media
                    await localhostShopwareRootExec(`mysql -u ${config.localhost.username} --password=${config.localhost.password} ${config.localhost.database} -e "TRUNCATE TABLE theme_media"`, config);
                }
            }
        );

        this.configureTasks.push(
            {
                title: "Compiling theme",
                task: async (): Promise<void> => {
                    await localhostShopwareRootExec(`bin/console theme:compile`, config);
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Creating a admin user',
                task: async (): Promise<void> => {
                    await localhostShopwareRootExec(`bin/console user:create -a ${configFile.shopwareBackend.adminUsername} -p ${configFile.shopwareBackend.adminPassword} --email ${configFile.shopwareBackend.adminEmailAddress}`, config);
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Reindexing Shopware (ES)',
                task: async (): Promise<void> => {
                    // Reindex
                    await localhostShopwareRootExec(`bin/console es:index -n`, config);
                    // Reset indexes
                    await localhostShopwareRootExec(`bin/console es:reset -n`, config);
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Flushing Shopware 6 caches',
                task: async (): Promise<void> => {
                    // Flush the shopware caches and import config data
                    await localhostShopwareRootExec(`bin/console cache:clear`, config);
                }
            }
        );
    }
}

export default ShopwareConfigureTask