import { Tab, TabList } from "@fluentui/react-components";
import { SettingsPage } from "./Pages";

type NavigationProps = {
    path: string;
    settingsPages: SettingsPage[];
    onNavigate: (path: string) => void;
};

export const Navigation = ({ settingsPages, path, onNavigate }: NavigationProps) => {
    return (
        <TabList
            selectedValue={path}
            onTabSelect={(_, { value }) => (typeof value === "string" ? onNavigate(value) : null)}
            vertical
            appearance="subtle"
            style={{ width: "100%" }}
        >
            {settingsPages.map(({ label, absolutePath }) => (
                <Tab key={`settings-page-tab-${absolutePath}`} value={absolutePath}>
                    {label}
                </Tab>
            ))}
        </TabList>
    );
};