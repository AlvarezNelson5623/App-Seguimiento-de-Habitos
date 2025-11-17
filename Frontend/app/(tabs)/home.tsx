import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLayoutEffect, useState, useEffect, useContext } from "react";
import { useNavigation } from "expo-router";
import { ThemeContext } from "../_layout";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Habit {
  id: number;
  nombre: string;
}


export default function InicioScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);

  const colors = {
    background: isDark ? "#0E1116" : "#F4F6FB",
    text: isDark ? "#FFFFFF" : "#0B0B0B",
    subtext: isDark ? "#B0B0B0" : "#6B6B6B",
    accent: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [weekDays, setWeekDays] = useState<{ day: string; date: Date }[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Cargar ID usuario
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
      }
    };
    loadUser();
  }, []);

  // 📌 Cargar hábitos del usuario desde la BD
  const loadHabits = async () => {
    try {
      const response = await fetch(
        `${API_URL}/habitos/usuario/${userId}`

      );
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      console.log("Error cargando hábitos:", err);
    }
  };

  // 🔄 Recargar hábitos 
  useEffect(() => {
  if (userId) loadHabits();
  }, [userId]);

  // Generar días de la semana
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
            const isSelected = item.date.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity
                key={i}
                style={[styles.day, isSelected && { backgroundColor: colors.accent }]}
                onPress={() => setSelectedDate(item.date)}
              >
                <ThemedText style={[styles.dayText, { color: isSelected ? "#fff" : colors.subtext }]}>
                  {item.day}
                </ThemedText>
                <ThemedText style={[styles.dayDate, { color: isSelected ? "#fff" : colors.text }]}>
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

      {/* ============================= */}
      {/*        HÁBITOS ACTIVOS        */}
      {/* ============================= */}

      <ScrollView style={styles.habitsContainer}>
        {habits.length > 0 ? (
          habits.map((h, i) => (
            <Animated.View
              key={h.id}
              entering={FadeInUp.duration(400).delay(80 * i)}
              style={[
                styles.habitCard,
                { backgroundColor: colors.surface, borderColor: colors.accent }
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={25} color={colors.accent} />
              <ThemedText style={[styles.habitText, { color: colors.text }]}>
                {h.nombre}
              </ThemedText>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.subtext} />
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
      <TouchableOpacity
        onPress={() => router.push("/create-habit")}
        style={[styles.addHabitButton, { backgroundColor: colors.accent }]}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <ThemedText style={[styles.addHabitText, { color: "#fff" }]}>Crear nuevo hábito</ThemedText>
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

  // HÁBITOS
  habitsContainer: { flex: 1 },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.3,
    marginBottom: 12,
    gap: 12,
  },
  habitText: { fontSize: 16, fontWeight: "600" },
  noHabitsContainer: { alignItems: "center", marginTop: 40 },
  noHabitsText: { fontStyle: "italic" },

  // BOTÓN
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
