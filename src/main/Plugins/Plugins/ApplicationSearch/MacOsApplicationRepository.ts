import type { PluginDependencies } from "@common/PluginDependencies";
import { join, normalize, parse } from "path";
import { Application } from "./Application";
import type { ApplicationRepository } from "./ApplicationRepository";
import type { MacOsApplicationIconGenerator } from "./MacOsApplicationIconGenerator";

export class MacOsApplicationRepository implements ApplicationRepository {
    public constructor(
        private readonly pluginDependencies: PluginDependencies,
        private readonly macOsApplicationIconGenerator: MacOsApplicationIconGenerator,
    ) {}

    public async getApplications(pluginId: string): Promise<Application[]> {
        const filePaths = await this.getAllFilePaths(pluginId);
        const icons = await this.getAllIcons(filePaths);

        return filePaths.map((filePath) => new Application(parse(filePath).name, filePath, icons[filePath]));
    }

    private async getAllFilePaths(pluginId: string): Promise<string[]> {
        const { commandlineUtility } = this.pluginDependencies;

        return (await commandlineUtility.executeCommandWithOutput(`mdfind "kMDItemKind == 'Application'"`))
            .split("\n")
            .map((filePath) => normalize(filePath).trim())
            .filter((filePath) => this.filterFilePathByConfiguredFolders(pluginId, filePath))
            .filter((filePath) => ![".", ".."].includes(filePath));
    }

    private filterFilePathByConfiguredFolders(pluginId: string, filePath: string): boolean {
        const { settingsManager } = this.pluginDependencies;

        return settingsManager
            .getPluginSettingByKey<string[]>(pluginId, "folders", this.getDefaultFolders())
            .some((folderPath) => filePath.startsWith(folderPath));
    }

    private async getAllIcons(filePaths: string[]): Promise<Record<string, string>> {
        const result: Record<string, string> = {};

        const promiseResults = await Promise.allSettled(
            filePaths.map((filePath) => this.macOsApplicationIconGenerator.generateApplicationIcon(filePath)),
        );

        for (const promiseResult of promiseResults) {
            if (promiseResult.status === "fulfilled") {
                result[promiseResult.value.applicationFilePath] = promiseResult.value.iconFilePath;
            }
        }

        return result;
    }

    private getDefaultFolders(): string[] {
        const { app } = this.pluginDependencies;

        return ["/System/Applications", "/Applications", join(app.getPath("home"), "Applications")];
    }
}