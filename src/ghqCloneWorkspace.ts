import { window, workspace, Uri, commands, ProgressLocation } from "vscode";
import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";

async function getCurrentRepositoryUrl(): Promise<string | undefined> {
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;
  
  return new Promise((resolve, reject) => {
    child_process.exec('git remote get-url origin', { cwd: workspacePath }, (err, stdout, stderr) => {
      if (err) {
        resolve(undefined);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function getRepositoryNameFromUrl(repositoryUrl: string): Promise<string> {
  // https://github.com/user/repo.git -> user/repo
  // git@github.com:user/repo.git -> user/repo
  const match = repositoryUrl.match(/(?:github\.com[\/:]|\/)([\w-]+)\/([\w-]+)(?:\.git)?/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  
  // フォールバック: URLから推測
  const parts = repositoryUrl.split('/');
  if (parts.length >= 2) {
    const repo = parts[parts.length - 1].replace('.git', '');
    const owner = parts[parts.length - 2];
    return `${owner}/${repo}`;
  }
  
  return 'unknown/repo';
}

async function findNextWorkspaceNumber(repositoryName: string): Promise<number> {
  const ghqRoot = process.env.GHQ_ROOT || path.join(process.env.HOME || '', 'ghq');
  const workspaceRoot = path.join(ghqRoot, 'workspace');
  
  if (!fs.existsSync(workspaceRoot)) {
    return 1;
  }

  const [owner, repoBase] = repositoryName.split('/');
  const ownerDir = path.join(workspaceRoot, owner);
  
  if (!fs.existsSync(ownerDir)) {
    return 1;
  }

  const entries = fs.readdirSync(ownerDir, { withFileTypes: true });
  const existingNumbers: number[] = [];
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const match = entry.name.match(new RegExp(`^${repoBase}(\\d+)?$`));
      if (match) {
        const num = match[1] ? parseInt(match[1], 10) : 1;
        existingNumbers.push(num);
      }
    }
  }
  
  if (existingNumbers.length === 0) {
    return 1;
  }
  
  existingNumbers.sort((a, b) => a - b);
  return Math.max(...existingNumbers) + 1;
}

async function cloneRepository(repositoryUrl: string, targetPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const targetDir = path.dirname(targetPath);
    
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    child_process.exec(`git clone "${repositoryUrl}" "${targetPath}"`, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`Failed to clone repository: ${stderr}`));
        return;
      }
      resolve();
    });
  });
}

export async function ghqCloneWorkspace() {
  try {
    // 現在のリポジトリURLを取得
    const repositoryUrl = await getCurrentRepositoryUrl();
    if (!repositoryUrl) {
      window.showErrorMessage('No git repository found in current workspace');
      return;
    }

    // リポジトリ名を取得
    const repositoryName = await getRepositoryNameFromUrl(repositoryUrl);
    
    // 次の番号を決定
    const nextNumber = await findNextWorkspaceNumber(repositoryName);
    const [owner, repoBase] = repositoryName.split('/');
    const newWorkspaceName = `${repoBase}${nextNumber}`;
    
    // ターゲットパスを構築
    const ghqRoot = process.env.GHQ_ROOT || path.join(process.env.HOME || '', 'ghq');
    const targetPath = path.join(ghqRoot, 'workspace', owner, newWorkspaceName);

    // ユーザーに確認
    const answer = await window.showInformationMessage(
      `Clone repository to: ${targetPath}?`,
      'Yes',
      'No'
    );

    if (answer !== 'Yes') {
      return;
    }

    // プログレス表示でクローン実行
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Cloning Repository',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: `Cloning to ${newWorkspaceName}...` });
        await cloneRepository(repositoryUrl, targetPath);
        progress.report({ message: 'Clone completed!' });
      }
    );

    // 新しいワークスペースを開くか確認
    const openAnswer = await window.showInformationMessage(
      `Repository cloned successfully! Open new workspace?`,
      'Open',
      'Cancel'
    );

    if (openAnswer === 'Open') {
      const uri = Uri.file(targetPath);
      await commands.executeCommand('vscode.openFolder', uri, true);
    }

  } catch (error) {
    window.showErrorMessage(`Error cloning workspace: ${error}`);
  }
}