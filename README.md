# ghq Workspace Manager

VS Code extension for managing multiple workspaces of the same repository with different branches.

## Features

- **Multi-workspace support**: Manage multiple local copies of the same repository
- **Branch display**: Shows current branch name for each workspace
- **Smart search**: Search by repository name + branch name
- **Quick open**: Open any workspace with a single command
- **Clone to new workspace**: Clone current repository to a new numbered workspace

## Requirements

- [VS Code CLI](https://code.visualstudio.com/docs/editor/command-line) (`code` command)
- Git repositories organized under `$GHQ_ROOT/workspace/` directory

## Directory Structure

The extension expects workspaces to be organized like this:

```
$GHQ_ROOT/workspace/
├── horai93/
│   ├── codespace1/    # Repository: horai93/codespace, Branch: main
│   ├── codespace2/    # Repository: horai93/codespace, Branch: feature-a
│   └── codespace3/    # Repository: horai93/codespace, Branch: feature-b
└── other-org/
    ├── project1/
    └── project2/
```

## Usage

### Open Existing Workspace
1. Use keyboard shortcut: **`Ctrl+Cmd+P`** (or open Command Palette and run **"ghq: Open Workspace"**)
2. Select a workspace from the list (shows repository name + branch)
3. The selected workspace opens in a new VS Code window

### Clone Current Repository to New Workspace
1. Open Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Run command: **"ghq: Clone Current Repository to New Workspace"**
3. Confirm the target directory
4. Wait for cloning to complete
5. Optionally open the new workspace immediately

## Display Format

Workspaces are displayed as:
- **Label**: `horai93/codespace (main)`
- **Description**: Full path to the workspace

## Search

You can search by:
- Repository name (e.g., "codespace")
- Branch name (e.g., "main", "feature-a")
- Combined search (e.g., "codespace main")

## Installation

1. Copy this extension to your VS Code extensions directory
2. Reload VS Code
3. The extension will be activated when you run the command

## Acknowledgments

Thanks to [aki77.ghq](https://marketplace.visualstudio.com/items?itemName=aki77.ghq) and [ytakhs/vscode-ghq-open](https://github.com/ytakhs/vscode-ghq-open) for the base code reference.

## License

MIT License - see the [LICENSE](LICENSE) file for details.