# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `pnpm run compile` - Compile TypeScript to JavaScript in the `out/` directory
- `pnpm run watch` - Watch for TypeScript changes and compile automatically
- `pnpm run vscode:prepublish` - Prepare for publishing (runs compile)
- `pnpm run test` - Run tests (compiles first, then runs tests from `out/test/`)

## Architecture

This is a VS Code extension that manages multiple workspaces of the same repository with different branches. The extension expects repositories to be organized under `$ghq_ROOT/workspace/` directory.

### Core Components

- **`src/extension.ts`** - Main extension entry point that registers the two commands
- **`src/ghqWorkspaceOpen.ts`** - Handles workspace discovery and opening via quick pick interface
- **`src/ghqCloneWorkspace.ts`** - Handles cloning current repository to a new numbered workspace

### Key Architecture Details

**Workspace Discovery Pattern**: The extension uses `find` command to locate `.git` directories under `$ghq_ROOT/workspace/` (max 3 levels deep), then extracts repository names and current branch information for each workspace.

**Repository Naming Convention**: Workspaces are numbered (e.g., `repo1`, `repo2`, `repo3`) and organized as `owner/repoN` under the workspace directory. The extension strips trailing numbers from directory names to determine the base repository name.

**Branch Detection**: Uses `git branch --show-current` to get the current branch for each workspace, with fallbacks to 'HEAD' or 'unknown' if git operations fail.

**QuickPick Integration**: Implements VS Code's QuickPick interface with custom `WorkspaceItem` objects that display as "owner/repo (branch)" with full path as description.

## Key Commands

- `extension.ghqWorkspaceOpen` - Bound to `Ctrl+Cmd+P` keybinding
- `extension.ghqCloneWorkspace` - Clone current repo to new numbered workspace

## Environment Requirements

- Requires `ghq_ROOT` environment variable (defaults to `~/ghq`)
- Expects VS Code CLI (`code` command) to be available
- Uses shell commands (`find`, `git`) for workspace discovery and operations