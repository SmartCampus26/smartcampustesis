# Configuración del entorno de desarrollo usando Nix para proyectos Expo / React Native
# Permite definir paquetes, variables de entorno y acciones automáticas del workspace
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Canal estable de nixpkgs a utilizar
  channel = "stable-25.05";
  # Paquetes necesarios para el proyecto
  packages = [ pkgs.nodejs_22 ];
  # Variables de entorno del workspace
  env = { EXPO_USE_FAST_RESOLVER = 1; };
  idx = {
    # Extensiones de VS Code recomendadas para el proyecto
    extensions = [
      "msjsdiag.vscode-react-native"
    ];
    workspace = {
      # Comandos que se ejecutan al crear el workspace por primera vez
      onCreate = {
        install =
          "npm ci --prefer-offline --no-audit --no-progress --timing && npm i @expo/ngrok@^4.1.0 react@latest react-dom@latest react-native@latest && npm i -D @types/react@latest";
      };
      # Comandos que se ejecutan al reiniciar el workspace
      onStart = {
        android = ''
          echo -e "\033[1;33mWaiting for Android emulator to be ready...\033[0m"
          # Wait for the device connection command to finish
          adb -s emulator-5554 wait-for-device && \
          npm run android -- --tunnel
        '';
      };
    };
    # Habilita y configura las vistas previas del proyecto
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "web" "--" "--port" "$PORT" ];
          manager = "web";
        };
        android = {
          # Comando vacío para mantener activa la vista previa
          command = [ "tail" "-f" "/dev/null" ];
          manager = "web";
        };
      };
    };
  };
}
