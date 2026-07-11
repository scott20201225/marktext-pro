# Application Data Directory

The per-user application data directory is located in the following directory:

- `%APPDATA%\marktextpro` on Windows
- `$XDG_CONFIG_HOME/marktextpro` or `~/.config/marktextpro` on Linux
- `~/Library/Application Support/marktextpro` on macOS

When [portable mode](PORTABLE.md) is enabled, the directory location is either the `--user-data-dir` parameter or `marktextpro-user-data` directory.
