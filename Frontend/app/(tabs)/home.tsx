import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLayoutEffect, useState, useEffect, useContext } from "react";
import { useNavigation } from "expo-router";
import { ThemeContext } from "../_layout"; // 👈 importamos el contexto

export default function InicioScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext); // 👈 usamos el tema global

  const colors = {
    background: isDark ? "#121212" : "#F7F9FC",
    text: isDark ? "#FFFFFF" : "#000000",
    subtext: isDark ? "#BBBBBB" : "#555555",
    card: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#2E2E2E" : "#E3E3E3",
    accent: isDark ? "#3A6DFF" : "#007AFF",
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [weekDays, setWeekDays] = useState<{ day: string; date: Date }[]>([]);

  useEffect(() => {
    const days = [];
    const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({ day: dayNames[i], date: d });
    }
    setWeekDays(days);
  }, [weekStart]);

  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // domingo como inicio
    return new Date(d.setDate(diff));
  }

  const changeWeek = (direction: "prev" | "next") => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newStart);
  };

  const formattedDateInfo = getDateInfo(selectedDate, currentDate);
  const habits = [{ id: 1, text: "un mensaje..." }];

  return ( 
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
          {formattedDateInfo.label}
        </ThemedText>
        <ThemedText type="default" style={[styles.headerSubtitle, { color: colors.subtext }]}>
          {formattedDateInfo.subLabel}
        </ThemedText>
      </View>

      {/* Calendario */}
      <View style={styles.calendarRow}>
        <TouchableOpacity onPress={() => changeWeek("prev")}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {weekDays.map((item, i) => {
            const isToday = item.date.toDateString() === currentDate.toDateString();
            const isSelected = item.date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.day,
                  (isToday || isSelected) && { backgroundColor: colors.accent },
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <ThemedText
                  style={[
                    styles.dayText,
                    { color: isSelected ? "#fff" : colors.subtext },
                  ]}
                >
                  {item.day}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.dayText,
                    { color: isSelected ? "#fff" : colors.subtext },
                  ]}
                >
                  {item.date.getDate()}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={() => changeWeek("next")}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface }]}>
          <ThemedText style={{ color: colors.subtext }}>TODOS</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.accent, flexDirection: "row" }]}>
          <Ionicons name="sunny-outline" size={16} color="white" />
          <ThemedText style={{ color: "#fff", fontWeight: "bold" }}> MAÑANA</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface }]}>
          <ThemedText style={{ color: colors.subtext }}>TARDE</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Lista de hábitos */}
      <ScrollView style={styles.habitsContainer}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <View key={habit.id} style={[styles.habitCard, { backgroundColor: colors.accent }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
              <ThemedText style={[styles.habitText, { color: "#fff" }]}>{habit.text}</ThemedText>
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </View>
          ))
        ) : (
          <View style={styles.noHabitsContainer}>
            <ThemedText style={[styles.noHabitsText, { color: colors.subtext }]}>
              No tienes hábitos para hoy 🎉
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Botón crear hábito */}
      <TouchableOpacity style={[styles.addHabitButton, { backgroundColor: colors.surface }]}>
        <ThemedText style={[styles.addHabitText, { color: colors.text }]}>
          CREAR UN NUEVO HÁBITO
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

// Función auxiliar
function getDateInfo(selected: Date, current: Date) {
  const diffDays = Math.floor(
    (selected.setHours(0, 0, 0, 0) - current.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  const dayNames = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
  ];
  const monthNames = [
    "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic",
  ];

  if (diffDays === 0) return { label: "HOY", subLabel: "" };
  if (diffDays === 1) return { label: "MAÑANA", subLabel: "" };
  if (diffDays === -1) return { label: "AYER", subLabel: "" };

  return {
    label: `${selected.getDate()} ${monthNames[selected.getMonth()]}`,
    subLabel: dayNames[selected.getDay()],
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 16 },
  header: { marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  headerSubtitle: { textTransform: "capitalize" },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarScroll: { flexDirection: "row", alignItems: "center" },
  day: { alignItems: "center", marginHorizontal: 2, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 },
  dayText: { fontSize: 12 },
  filters: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, alignItems: "center" },
  habitsContainer: { flex: 1, marginBottom: 12 },
  habitCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 16,
    padding: 16, marginBottom: 12, justifyContent: "space-between",
  },
  habitText: { flex: 1, marginHorizontal: 8 },
  noHabitsContainer: { alignItems: "center", marginTop: 40 },
  noHabitsText: { fontStyle: "italic" },
  addHabitButton: { borderRadius: 16, padding: 16, alignItems: "center" },
  addHabitText: { fontWeight: "bold" },
});
