import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function InicioScreen() {
  const habits = [
    { id: 1, text: "Interrumpe tu exposición a las..." },
    // si está vacío, el espacio quedará libre
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header con fecha */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>HOY</ThemedText>
        <ThemedText type="default" style={styles.headerSubtitle}>22 sept</ThemedText>
      </View>

      {/* Calendario compacto */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.calendar}
      >
        {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.day, i === 1 && styles.activeDay]}
          >
            <ThemedText style={i === 1 ? styles.activeDayText : styles.dayText}>
              {day}
            </ThemedText>
            <ThemedText style={i === 1 ? styles.activeDayText : styles.dayText}>
              {21 + i}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

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

      {/* Lista de hábitos del día */}
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
        <ThemedText style={styles.addHabitText}>CREAR UN NUEVO HÁBITO</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40, // margen para que no quede debajo de la hora
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    color: "#bbb",
  },
  calendar: {
    marginBottom: 12,
  },
  day: {
    alignItems: "center",
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeDay: {
    backgroundColor: "#2E3A59",
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
