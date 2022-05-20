import {localhostShopwareRootExec} from '../utils/console';
import { Listr } from 'listr2';

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
                    await localhostShopwareRootExec(`bin/console sales-channel:update:domain shopware-test.development`, config);
                    // @TODO: Replace https to http & replace static domain
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
                    //
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Creating a dummy customer on every website',
                task: async (): Promise<void> => {
                    //
                }
            }
        );

        this.configureTasks.push(
            {
                title: "Configuring Wordpress settings within Magento",
                task: async (): Promise<void> => {
                    //
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Reindexing Magento',
                task: async (): Promise<void> => {
                    // Reindex data, only when elastic is used
                }
            }
        );

        this.configureTasks.push(
            {
                title: 'Flushing Shopware 6 caches',
                task: async (): Promise<void> => {
                    // Flush the magento caches and import config data
                    await localhostShopwareRootExec(`bin/console cache:clear`, config);
                }
            }
        );
    }
}

export default ShopwareConfigureTask
