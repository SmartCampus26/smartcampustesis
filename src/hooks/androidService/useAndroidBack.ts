import * as React from 'react'; // Importación más segura
import { BackHandler } from 'react-native';

export function useAndroidBack(onBack: () => void) {
  // Usamos React.useEffect para asegurar que viene del core de React
  React.useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });

    return () => handler.remove();
  }, [onBack]);
}