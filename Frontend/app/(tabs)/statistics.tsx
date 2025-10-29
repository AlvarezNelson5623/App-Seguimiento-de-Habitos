import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../_layout";

export default function EstadisticasScreen() {
  const { isDark } = useContext(ThemeContext);

  const colors = {
    background: isDark ? "#121212" : "#F7F9FC",
    text: isDark ? "#FFFFFF" : "#000000",
    subtext: isDark ? "#BBBBBB" : "#555555",
    accent: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, shadowColor: colors.text },
        ]}
      >
        <Ionicons name="stats-chart-outline" size={50} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>
          Estadísticas
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          En construcción 🚧
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Estamos trabajando para ofrecerte métricas detalladas sobre tu progreso.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "90%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
