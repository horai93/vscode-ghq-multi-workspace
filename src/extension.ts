/**
 * GHQ Workspace Manager
 * 
 * VS Code extension for managing multiple workspaces of the same repository with different branches.
 * 
 * Inspired by:
 * - aki77.ghq: https://marketplace.visualstudio.com/items?itemName=aki77.ghq
 * - ytakhs/vscode-ghq-open: https://github.com/ytakhs/vscode-ghq-open
 */

import { ExtensionContext, commands } from "vscode";
import { ghqWorkspaceOpen } from "./ghqWorkspaceOpen";
import { ghqCloneWorkspace } from "./ghqCloneWorkspace";

export function activate(context: ExtensionContext) {
  console.log('GHQ Workspace Manager extension is now active!');
  
  context.subscriptions.push(
    commands.registerCommand("extension.ghqWorkspaceOpen", ghqWorkspaceOpen),
    commands.registerCommand("extension.ghqCloneWorkspace", ghqCloneWorkspace)
  );
}

export function deactivate() {}