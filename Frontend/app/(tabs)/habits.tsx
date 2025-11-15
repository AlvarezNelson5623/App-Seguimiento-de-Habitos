import { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemeContext } from "../_layout";

export default function HabitsScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    background: isDark ? "#0E1116" : "#F4F6FB",
    text: isDark ? "#FFFFFF" : "#0B0B0B",
    subtext: isDark ? "#B0B0B0" : "#6B6B6B",
    accent: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    soft: isDark ? "#2A2A2A" : "#E8E8E8",
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/habits"); // 👈 Ajusta el endpoint a tu backend
        const data = await res.json();
        setHabits(data);
      } catch (error) {
        console.error("Error al obtener hábitos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={{ marginTop: 10, color: colors.text }}>Cargando hábitos...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
          Selecciona tus hábitos
        </ThemedText>
        <ThemedText type="default" style={[styles.headerSubtitle, { color: colors.subtext }]}>
          Escoge los hábitos que quieres seguir
        </ThemedText>
      </View>

      <ScrollView style={styles.habitsContainer}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <Animated.View
              key={habit.id}
              entering={FadeInUp.duration(400).delay(100 * habit.id)}
              style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
            >
              <TouchableOpacity style={styles.checkbox}>
                <Ionicons name="ellipse-outline" size={24} color={colors.accent} />
              </TouchableOpacity>
              <ThemedText style={[styles.habitText, { color: colors.text }]}>{habit.nombre}</ThemedText>
              <Ionicons name="information-circle-outline" size={20} color={colors.subtext} />
            </Animated.View>
          ))
        ) : (
          <View style={styles.noHabitsContainer}>
            <ThemedText style={[styles.noHabitsText, { color: colors.subtext }]}>
              No hay hábitos disponibles 😅
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45, paddingHorizontal: 18 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 16 },
  habitsContainer: { flex: 1 },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    justifyContent: "space-between",
    borderWidth: 1,
  },
  habitText: { flex: 1, marginHorizontal: 10, fontSize: 15 },
  checkbox: { marginRight: 10 },
  noHabitsContainer: { alignItems: "center", marginTop: 40 },
  noHabitsText: { fontStyle: "italic" },
});
