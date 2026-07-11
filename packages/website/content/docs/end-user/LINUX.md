# Linux Installation Instructions

## AppImage

[Download the AppImage](https://github.com/scott20201225/marktext-pro/releases/latest) and type the following:

1. `chmod +x marktextpro-%version%-x86_64.AppImage`
2. `./marktextpro-%version%-x86_64.AppImage`
3. Now you can execute MarkTextPro.

### Installation

You cannot really install an AppImage. It's a file which can run directly after getting executable permission. To integrate it into desktop environment, you can either create desktop entry manually **or** use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

#### Desktop file creation

See [example desktop file](https://github.com/scott20201225/marktext-pro/blob/main/resources/linux/marktextpro.desktop).

```bash
$ curl -L https://raw.githubusercontent.com/scott20201225/marktext-pro/main/resources/linux/marktextpro.desktop -o $HOME/.local/share/applications/marktextpro.desktop

# Update the Exec in desktop file to your real marktextpro command. Specify Path if necessary.
$ vim $HOME/.local/share/applications/marktextpro.desktop

$ update-desktop-database $HOME/.local/share/applications/
```

#### AppImageLauncher integration

You can integrate the AppImage into the system via [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher). It will handle the desktop entry automatically.

### Uninstallation

1. Delete AppImage file.
2. Delete your desktop file if exists.
3. Delete your user settings: `~/.config/marktextpro`

### Custom launch script

1. Save AppImage somewhere. Let's say `~/bin/marktextpro.AppImage`
2. `chmod +x ~/bin/marktextpro.AppImage`
3. Create a launch script:

   ```sh
   #!/bin/bash
   DESKTOPINTEGRATION=0 ~/bin/marktextpro.AppImage
   ```

### Known issues

- MarkTextPro is always integrated into desktop environment after updating

## Binary

You can download the latest `marktextpro-%version%.tar.gz` package from the [release page](https://github.com/scott20201225/marktext-pro/releases/latest). You may need to install electron dependencies.

## Arch User Repository

MarkTextPro is available on the AUR as `marktextpro-bin` and will automatically install the dependencies: `glibc`, `gtk3`, `nss`, `alsa-lib`, `libxss`, `cups`, `libxkbcommon`, `libxkbfile`, `mesa`, and `hicolor-icon-theme`.

Install it via an AUR helper like `yay -S marktextpro-bin` or with

```bash
git clone https://aur.archlinux.org/marktextpro.git
cd marktextpro-bin
makepkg -si
```

Note: The AUR package is not maintained by the maintainer of this repository and may be out of date. Take note of the version numbers and modify the PKGBUILD on the AUR as necessary before installation or update.
