import type { ActionHandler } from "@Core/ActionHandler";
import type { SearchResultItemAction } from "@common/Core";
import type { EmptyTrash } from "./EmptyTrash";

export class EmptyTrashActionHandler implements ActionHandler {
    public readonly id = "EmptyTrash";

    public constructor(private readonly emptyTrash: EmptyTrash) {}

    public async invokeAction(action: SearchResultItemAction): Promise<void> {
        if (action.argument !== "empty") {
            throw new Error(`Argument "${action.argument}" is not supported`);
        }

        await this.emptyTrash.emptyTrash();
    }
}
