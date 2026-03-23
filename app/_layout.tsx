import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SavedProvider } from "./Camera/context/SavedContext";
import * as React from 'react';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '../src/lib/Supabase';
import { NetworkProvider } from "./Camera/context/Networkcontext";
import { ToastProvider } from "../src/components/ToastContext";
import { SesionProvider, useSesion } from './Camera/context/SesionContext' 

function RouteGuard() {
  const { sesion, cargando } = useSesion();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    const enAuth = segments[0] === '(auth)';

    if (!sesion && enAuth) {
      // Sin sesión dentro de auth → al login
      router.replace('/');
      return;
    }

    if (sesion && !enAuth) {
      // Con sesión fuera de auth → redirigir según rol
      const rol = sesion.tipo === 'empleado' ? sesion.data.deptEmpl : sesion.rol;

      switch (rol) {
        case 'autoridad':
          router.replace('/(auth)/HomeAutoridad'); break;
        case 'docente':
          router.replace('/(auth)/HomeDocente'); break;
        case 'mantenimiento':
        case 'sistemas':
          router.replace('/(auth)/HomeEmpleado'); break;
        default:
          router.replace('/'); break;
      }
    }
  }, [sesion, cargando, segments]);

  return null;
}

export default function RootLayout() {

  const router = useRouter()

  useEffect(() => {
    console.log('🔗 Mi URL de desarrollo:', Linking.createURL('reset-password'))

    // ── Captura el deep link cuando la app YA ESTÁ abierta ──
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔗 Deep link recibido (app abierta):', url)
      handleDeepLink(url)
    })

    // ── Captura el deep link si la app estaba CERRADA ──
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Deep link inicial (app cerrada):', url)
        handleDeepLink(url)
      }
    })

    return () => subscription.remove()
  }, [])

  const handleDeepLink = async (url: string) => {
    if (!url) return

    try {
      const parsed = Linking.parse(url)
      console.log('📦 URL parseado:', JSON.stringify(parsed))

      // Extraer parámetros — pueden venir como query params o en el hash (#)
      const accessToken =
        parsed.queryParams?.access_token as string ||
        url.match(/access_token=([^&#]+)/)?.[1]

      const refreshToken =
        parsed.queryParams?.refresh_token as string ||
        url.match(/refresh_token=([^&#]+)/)?.[1]

      const type =
        parsed.queryParams?.type as string ||
        url.match(/[?&#]type=([^&#]+)/)?.[1]

      console.log('🔑 type:', type, '| access_token:', !!accessToken)

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('❌ Error setSession:', error.message)
          return
        }

        console.log('✅ Sesión establecida, type:', type)

        // ── Redirigir según el tipo de link ──
        if (type === 'recovery') {
          // Recuperación de contraseña → paso 3 de ContraseniaOlvidada
          router.replace('/ContraseniaOlvidada')
        } else if (type === 'signup') {
          // Verificación de cuenta nueva → pantalla de éxito
          router.replace('/verify-email')
        }
      }
    } catch (err) {
      console.error('❌ Error handleDeepLink:', err)
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <ToastProvider>
        <SesionProvider>     
        <RouteGuard />
          <SavedProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </SavedProvider>
          </SesionProvider>     
        </ToastProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}