import { window, QuickPickItem, Uri, commands } from "vscode";
import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";

interface WorkspaceItem extends QuickPickItem {
  absolutePath: string;
  repositoryName: string;
  branchName: string;
}

class GhqWorkspaceItem implements WorkspaceItem {
  label: string;
  description: string;
  absolutePath: string;
  repositoryName: string;
  branchName: string;

  constructor(absolutePath: string, repositoryName: string, branchName: string) {
    this.absolutePath = absolutePath;
    this.repositoryName = repositoryName;
    this.branchName = branchName;
    this.label = `${repositoryName} (${branchName})`;
    this.description = absolutePath;
  }
}

function getCurrentBranch(workspacePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const gitDir = path.join(workspacePath, '.git');
    
    if (!fs.existsSync(gitDir)) {
      resolve('no-git');
      return;
    }

    child_process.exec('git branch --show-current', { cwd: workspacePath }, (err, stdout, stderr) => {
      if (err) {
        resolve('unknown');
        return;
      }
      
      const branch = stdout.trim() || 'HEAD';
      resolve(branch);
    });
  });
}

function getRepositoryName(workspacePath: string): string {
  const parts = workspacePath.split(path.sep);
  const workspaceIndex = parts.indexOf('workspace');
  
  if (workspaceIndex !== -1 && parts.length > workspaceIndex + 2) {
    return `${parts[workspaceIndex + 1]}/${parts[workspaceIndex + 2].replace(/\d+$/, '')}`;
  }
  
  return path.basename(workspacePath);
}

function findWorkspaces(): Promise<WorkspaceItem[]> {
  return new Promise((resolve, reject) => {
    const ghqRoot = process.env.GHQ_ROOT || path.join(process.env.HOME || '', 'ghq');
    const workspaceRoot = path.join(ghqRoot, 'workspace');
    
    if (!fs.existsSync(workspaceRoot)) {
      resolve([]);
      return;
    }

    child_process.exec(`find "${workspaceRoot}" -maxdepth 3 -type d -name ".git" | sed 's/.git$//'`, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`Failed to find workspaces: ${stderr}`));
        return;
      }

      const workspacePaths = stdout.trim().split('\n').filter(p => p.length > 0);
      
      Promise.all(
        workspacePaths.map(async (workspacePath) => {
          const repositoryName = getRepositoryName(workspacePath);
          const branchName = await getCurrentBranch(workspacePath);
          return new GhqWorkspaceItem(workspacePath, repositoryName, branchName);
        })
      ).then(resolve).catch(reject);
    });
  });
}

async function openWorkspace(workspacePath: string): Promise<void> {
  try {
    const uri = Uri.file(workspacePath);
    await commands.executeCommand('vscode.openFolder', uri, true);
  } catch (err) {
    throw new Error(`Failed to open workspace: ${err}`);
  }
}

export async function ghqWorkspaceOpen() {
  let workspaces: WorkspaceItem[];

  try {
    workspaces = await findWorkspaces();
  } catch (err) {
    window.showErrorMessage(`Error finding workspaces: ${err}`);
    return;
  }

  if (workspaces.length === 0) {
    window.showInformationMessage('No workspaces found in ghq/workspace directory');
    return;
  }

  const quickPick = window.createQuickPick<WorkspaceItem>();
  quickPick.items = workspaces;
  quickPick.placeholder = 'Select a workspace to open...';
  quickPick.matchOnDescription = true;
  
  quickPick.onDidChangeSelection(async (selection) => {
    if (selection[0]) {
      quickPick.hide();
      try {
        await openWorkspace(selection[0].absolutePath);
      } catch (err) {
        window.showErrorMessage(`Error opening workspace: ${err}`);
      }
    }
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}