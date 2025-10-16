import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "expo-router";

export default function InicioScreen() {
  const navigation = useNavigation();

  // 🔹 Ocultar encabezado automático
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // 🔹 Estado de la fecha actual, seleccionada y de inicio de semana
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  // 🔹 Generar los días de la semana
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

  // 🔹 Función auxiliar: obtener inicio de semana
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // domingo como inicio
    return new Date(d.setDate(diff));
  }

  // 🔹 Cambiar semana (anterior o siguiente)
  const changeWeek = (direction: "prev" | "next") => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newStart);
  };

  // 🔹 Calcular cómo mostrar la fecha seleccionada
  const formattedDateInfo = getDateInfo(selectedDate, currentDate);

  const habits = [{ id: 1, text: "un mensaje..." }];

  return (
    <ThemedView style={styles.container}>
      {/* Header con fecha dinámica */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {formattedDateInfo.label}
        </ThemedText>
        <ThemedText type="default" style={styles.headerSubtitle}>
          {formattedDateInfo.subLabel}
        </ThemedText>
      </View>

      {/* Calendario compacto con controles de semana */}
      <View style={styles.calendarRow}>
        <TouchableOpacity onPress={() => changeWeek("prev")}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScroll}
        >
          {weekDays.map((item, i) => {
            const isToday =
              item.date.toDateString() === currentDate.toDateString();
            const isSelected =
              item.date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.day,
                  (isToday || isSelected) && styles.activeDay,
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <ThemedText
                  style={isSelected ? styles.activeDayText : styles.dayText}
                >
                  {item.day}
                </ThemedText>
                <ThemedText
                  style={isSelected ? styles.activeDayText : styles.dayText}
                >
                  {item.date.getDate()}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={() => changeWeek("next")}>
          <Ionicons name="chevron-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterText}>TODOS</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Ionicons name="sunny-outline" size={16} color="white" />
          <ThemedText style={styles.activeFilterText}> MAÑANA</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterText}>TARDE</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Lista de hábitos */}
      <ScrollView style={styles.habitsContainer}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <View key={habit.id} style={styles.habitCard}>
              <Ionicons name="phone-portrait-outline" size={20} color="white" />
              <ThemedText style={styles.habitText}>{habit.text}</ThemedText>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </View>
          ))
        ) : (
          <View style={styles.noHabitsContainer}>
            <ThemedText style={styles.noHabitsText}>
              No tienes hábitos para hoy 🎉
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Botón crear nuevo hábito */}
      <TouchableOpacity style={styles.addHabitButton}>
        <ThemedText style={styles.addHabitText}>
          CREAR UN NUEVO HÁBITO
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

// 🔹 Función auxiliar para determinar cómo mostrar la fecha seleccionada
function getDateInfo(selected: Date, current: Date) {
  const diffDays = Math.floor(
    (selected.setHours(0, 0, 0, 0) - current.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  const dayNames = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const monthNames = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sept",
    "oct",
    "nov",
    "dic",
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
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    color: "#bbb",
    textTransform: "capitalize",
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarScroll: {
    flexDirection: "row",
    alignItems: "center",
  },
  day: {
    alignItems: "center",
    marginHorizontal: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeDay: {
    backgroundColor: "#3A6DFF",
  },
  dayText: {
    color: "#aaa",
    fontSize: 12,
  },
  activeDayText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#2E2E2E",
    flexDirection: "row",
    alignItems: "center",
  },
  filterText: {
    color: "#aaa",
  },
  activeFilter: {
    backgroundColor: "#3A6DFF",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  habitsContainer: {
    flex: 1,
    marginBottom: 12,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A6DFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  habitText: {
    color: "white",
    flex: 1,
    marginHorizontal: 8,
  },
  noHabitsContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noHabitsText: {
    color: "#aaa",
    fontStyle: "italic",
  },
  addHabitButton: {
    backgroundColor: "#2E2E2E",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  addHabitText: {
    color: "white",
    fontWeight: "bold",
  },
});
