import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLayoutEffect, useState, useEffect, useContext } from "react";
import { useNavigation } from "expo-router";
import { ThemeContext } from "../_layout";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function InicioScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);

  const colors = {
    background: isDark ? "#0E1116" : "#F4F6FB",
    text: isDark ? "#FFFFFF" : "#0B0B0B",
    subtext: isDark ? "#B0B0B0" : "#6B6B6B",
    accent: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    soft: isDark ? "#2A2A2A" : "#E8E8E8",
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
    const diff = d.getDate() - d.getDay();
    return new Date(d.setDate(diff));
  }

  const changeWeek = (direction: "prev" | "next") => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newStart);
  };

  const formattedDateInfo = getDateInfo(selectedDate, currentDate);
  const habits = [{ id: 1, text: "EJEMPLO: Tomar 2L de agua 💧" }];

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
      <View style={[styles.calendarRow, { backgroundColor: colors.surface }]}>
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
                  isSelected && { backgroundColor: colors.accent },
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
                    styles.dayDate,
                    { color: isSelected ? "#fff" : colors.text },
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
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.soft }]}>
          <ThemedText style={{ color: colors.text }}>Todos</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.accent, flexDirection: "row" }]}>
          <Ionicons name="sunny-outline" size={16} color="white" />
          <ThemedText style={{ color: "#fff", fontWeight: "bold", marginLeft: 5 }}>Mañana</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.soft }]}>
          <ThemedText style={{ color: colors.text }}>Tarde</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Lista de hábitos */}
      <ScrollView style={styles.habitsContainer}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <Animated.View
              key={habit.id}
              entering={FadeInUp.duration(400).delay(100 * habit.id)}
              style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.accent} />
              <ThemedText style={[styles.habitText, { color: colors.text }]}>{habit.text}</ThemedText>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} />
            </Animated.View>
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
      <TouchableOpacity style={[styles.addHabitButton, { backgroundColor: colors.accent }]}>
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <ThemedText style={[styles.addHabitText, { color: "#fff" }]}>
          Crear nuevo hábito
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

function getDateInfo(selected: Date, current: Date) {
  const diffDays =
    (selected.setHours(0, 0, 0, 0) - current.setHours(0, 0, 0, 0)) /
    (1000 * 60 * 60 * 24);

  const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

  if (diffDays === 0) return { label: "Hoy", subLabel: "" };
  if (diffDays === 1) return { label: "Mañana", subLabel: "" };
  if (diffDays === -1) return { label: "Ayer", subLabel: "" };

  return {
    label: `${selected.getDate()} ${monthNames[selected.getMonth()]}`,
    subLabel: dayNames[selected.getDay()],
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45, paddingHorizontal: 18 },
  header: { marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: 0.3 },
  headerSubtitle: { textTransform: "capitalize", fontSize: 16 },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  calendarScroll: { flexDirection: "row", alignItems: "center" },
  day: {
    alignItems: "center",
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 48,
  },
  dayText: { fontSize: 12, fontWeight: "600" },
  dayDate: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
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
  noHabitsContainer: { alignItems: "center", marginTop: 40 },
  noHabitsText: { fontStyle: "italic" },
  addHabitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    elevation: 5,
  },
  addHabitText: { fontWeight: "bold", fontSize: 15, marginLeft: 6 },
});
