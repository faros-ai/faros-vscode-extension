import { ExtensionContext } from "vscode";

export const clearGlobalState = (extensionContext: ExtensionContext) => {
    for (const key of extensionContext.globalState.keys()) {
        extensionContext.globalState.update(key, undefined);
    }
};