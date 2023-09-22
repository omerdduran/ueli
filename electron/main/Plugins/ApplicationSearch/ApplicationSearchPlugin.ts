import type { OperatingSystem } from "@common/OperatingSystem";
import type { UeliPlugin } from "@common/UeliPlugin";
import type { PluginDependencies } from "../PluginDependencies";
import type { ApplicationRepository } from "./ApplicationRepository";
import { MacOsApplicationIconGenerator } from "./MacOsApplicationIconGenerator";
import { MacOsApplicationRepository } from "./MacOsApplicationRepository";
import { WindowsApplicationRepository } from "./WindowsApplicationRepository";

export class ApplicationSearchPlugin implements UeliPlugin {
    public readonly id = "ApplicationSearch";
    public readonly name = "Application Search";
    public readonly nameTranslationKey = "plugin[ApplicationSearch].pluginName";
    public readonly supportedOperatingSystems: OperatingSystem[] = ["macOS", "Windows"];

    private applicationRepositories: Record<OperatingSystem, ApplicationRepository>;

    public constructor(private readonly pluginDependencies: PluginDependencies) {
        this.applicationRepositories = {
            macOS: new MacOsApplicationRepository(
                pluginDependencies,
                this.id,
                new MacOsApplicationIconGenerator(pluginDependencies),
            ),
            Windows: new WindowsApplicationRepository(pluginDependencies, this.id),
        };
    }

    public async addSearchResultItemsToSearchIndex(): Promise<void> {
        const { searchIndex } = this.pluginDependencies;

        const applications =
            await this.applicationRepositories[this.pluginDependencies.operatingSystem].getApplications();

        searchIndex.addSearchResultItems(
            this.id,
            applications.map((application) => application.toSearchResultItem()),
        );
    }
}
