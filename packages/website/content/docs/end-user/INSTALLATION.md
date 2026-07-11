# Installation

MarkTextPro is a free, open-source Markdown editor for **Linux**, **macOS** and **Windows**. Pre-built binaries are published with every release on [GitHub releases](https://github.com/scott20201225/marktext-pro/releases/latest). Pick the one that matches your platform.

## Windows

| Artifact | When to choose |
| --- | --- |
| `marktextpro-win-x64-<version>-setup.exe` | Recommended. NSIS installer; per-user install, lets you pick the install directory, creates Start Menu and Desktop shortcuts. |
| `marktextpro-win-x64-<version>.zip` | Portable zip. Extract anywhere and run `marktextpro.exe`. See [Portable mode](PORTABLE.md) for details on keeping your data alongside the app. |

After installing, MarkTextPro registers itself as a handler for `.md`, `.markdown`, `.mmd`, `.mdown`, `.mdtxt` and `.mdtext` files.

## macOS

| Artifact | When to choose |
| --- | --- |
| `marktextpro-mac-arm64-<version>.dmg` | Apple Silicon (M1 / M2 / M3 / M4). |
| `marktextpro-mac-x64-<version>.dmg` | Intel Macs. |
| `marktextpro-mac-<arch>-<version>.zip` | Plain zip alternative to the DMG. |

Open the DMG and drag MarkTextPro into your **Applications** folder. Builds are not currently notarized, so the first launch may prompt the system Gatekeeper — right-click the app and choose **Open** to accept it once.

You can also install via Homebrew Cask:

```sh
brew install --cask marktextpro
```

## Linux

MarkTextPro is shipped in five Linux formats. Most users want the AppImage.

| Artifact | When to choose |
| --- | --- |
| `marktextpro-linux-<version>.AppImage` | Recommended. Runs on most distros without root. `chmod +x` and double-click (or run directly). |
| `marktextpro-linux-<version>.deb` | Debian, Ubuntu, Linux Mint, Pop!_OS, … (`sudo apt install ./marktextpro-linux-<version>.deb`). |
| `marktextpro-linux-<version>.rpm` | Fedora, RHEL, openSUSE, … (`sudo rpm -i marktextpro-linux-<version>.rpm`). |
| `marktextpro-linux-<version>.snap` | Ubuntu / any snap-enabled distro (`sudo snap install marktextpro-linux-<version>.snap --dangerous --classic`). |
| `marktextpro-linux-<version>.tar.gz` | Portable tarball. Extract and run the included `marktextpro` binary. |

Arch Linux users can install MarkTextPro from the AUR (`marktextpro-bin`).

> [!NOTE]
> See [Linux notes](LINUX.md) for distro-specific tips (sandbox flags, font configuration, file-association quirks).

## Verify the download

Every release contains a `latest-<platform>.yml` file with SHA-512 hashes. To verify:

```sh
# Example on macOS / Linux
shasum -a 512 marktextpro-linux-<version>.AppImage
```

Compare the value to the entry in `latest-linux.yml` on the release page.

## Build from source

If you'd rather build from source — for example to track `develop`, to run on an architecture we don't publish a binary for, or to contribute — see the [Build instructions](../dev/BUILD.md) in the developer docs. A minimal recap:

```sh
git clone https://github.com/scott20201225/marktext-pro.git
cd marktextpro
pnpm install
pnpm run build
```

Output installers land in the repository's `dist/` folder.

## Updating

MarkTextPro checks for updates on launch (this can be disabled under **Preferences → General → Updates**). When an update is published, the app downloads it in the background and installs on next restart.

Portable installs and the AppImage do not auto-update — re-download the latest artifact when you want to upgrade.

## Uninstall

| Platform | How |
| --- | --- |
| Windows | **Settings → Apps**, or run the bundled `Uninstall MarkTextPro.exe`. |
| macOS | Drag **MarkTextPro.app** to the Trash. Optionally also remove `~/Library/Application Support/marktextpro`. |
| Linux (.deb) | `sudo apt remove marktextpro` |
| Linux (.rpm) | `sudo rpm -e marktextpro` |
| Linux (snap) | `sudo snap remove marktextpro` |
| Linux (AppImage / tar.gz) | Delete the file you extracted. |

To wipe MarkTextPro's user data as well, remove its [application data directory](APPLICATION_DATA_DIRECTORY.md).
