import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, createContext } from "react";
import "react-native-reanimated";

/**
 * Contexto global para alternar entre modo oscuro y claro.
 */
export const ThemeContext = createContext({
  toggleTheme: () => {},
  isDark: true,
});

/**
 * Configuración experimental de Expo Router (mantiene las tabs ancladas).
 */
export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * Layout raíz de la aplicación.
 * Controla la navegación entre el login y las tabs principales.
 */
export default function RootLayout() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  /**
   * Simulación del control de sesión.
   * Más adelante conectará con tu backend (por ejemplo, con AsyncStorage o JWT).
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = null; // luego leerás desde AsyncStorage o token JWT
        setUser(storedUser);
      } catch (error) {
        console.error("Error verificando sesión:", error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return null;

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDark }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
            {!user ? (
              <Stack.Screen name="login" />
            ) : (
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            )}
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
