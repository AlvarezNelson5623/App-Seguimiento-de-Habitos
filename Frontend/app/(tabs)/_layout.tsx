import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../_layout"; // Importamos el mismo contexto
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

export default function TabLayout() {
  const { isDark } = useContext(ThemeContext); // Leemos el modo actual

  const activeColor = isDark ? "#8ab4f8" : "#007AFF";
  const inactiveColor = isDark ? "#aaa" : "#555";
  const backgroundColor = isDark ? "#121212" : "#fff";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor,
            borderTopColor: isDark ? "#333" : "#ddd",
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Hábitos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkmark-done" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: "Estadísticas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
