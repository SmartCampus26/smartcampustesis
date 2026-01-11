import { Stack } from "expo-router";
//Se importa el componente Stack, que se utiliza para manejar la navegación entre pantallas en forma de pila
export default function RootLayout() {
  //Define el componente RootLayout, que actúa como el layout raíz de la aplicación
  return <Stack />;
  //Indica que la aplicación usará una navegación tipo Stack
  //Todas las pantallas dentro de la carpeta app se mostrarán siguiendo este tipo de navegación
}
