# Changelog

## [v0.0.1](https://github.com/horai93/vscode-ghq-multi-workspace/commits/v0.0.1) - 2025-06-21

## [v0.1.0](https://github.com/horai93/vscode-ghq-multi-workspace/commits/v0.1.0) - 2025-06-21
- Release for v0.1.0 by @github-actions in https://github.com/horai93/vscode-ghq-multi-workspace/pull/1

## [v0.1.0](https://github.com/horai93/vscode-ghq-multi-workspace/commits/v0.1.0) - 2025-06-21

## [Unreleased]

### Added
- Multi-workspace support for managing multiple local copies of the same repository
- Branch display showing current branch name for each workspace
- Smart search by repository name and branch name
- Quick open functionality to open any workspace with a single command
- Clone current repository to new numbered workspace feature
- VS Code internal API integration (no dependency on external `code` command)

### Changed
- Uses VS Code commands.executeCommand instead of shell commands for better compatibility

### Fixed
- Initial release
