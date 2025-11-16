import React, { useContext, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Modal 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../_layout";
import { useRouter } from "expo-router";

export default function HabitsScreen() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();

  const [habitosActuales, setHabitosActuales] = useState([]);
  const [habitosRecomendados, setHabitosRecomendados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const userId = 1;

  const colors = {
    background: isDark ? "#0E0F12" : "#F4F6FA",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A7A7A7" : "#6B6B6B",
    accent: isDark ? "#4C8BFF" : "#3A7BFF",
    surface: isDark ? "#181A1F" : "#FFFFFF",
  };

  const openHabitModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const closeHabitModal = () => {
    setModalVisible(false);
    setSelectedHabit(null);
  };

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const resActuales = await fetch(`http://192.168.1.99:3000/api/habitos/usuario/${userId}`);
        const actuales = await resActuales.json();

        const resRecomendados = await fetch(`http://192.168.1.99:3000/api/habitos/recomendados/${userId}`);
        const recomendados = await resRecomendados.json();

        setHabitosActuales(actuales);
        setHabitosRecomendados(recomendados);
      } catch (err) {
        console.error("Error cargando hábitos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.container, { paddingTop: 60 }]}>

        {/* ------------------ HÁBITOS ACTUALES ------------------ */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos actuales</Text>

        {habitosActuales.length === 0 ? (
          <Text style={[styles.subtext, { color: colors.subtext }]}>No tienes hábitos activos aún.</Text>
        ) : (
          habitosActuales.map((h) => (
            <TouchableOpacity
              key={h.id}
              onPress={() => openHabitModal(h)}
            >
              <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{h.nombre}</Text>
                {h.descripcion && (
                  <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>{h.descripcion}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* ------------------ HÁBITOS RECOMENDADOS ------------------ */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 30 }]}>
          Hábitos recomendados
        </Text>

        {habitosRecomendados.map((h) => (
          <TouchableOpacity
            key={h.id}
            onPress={() =>
              router.push(`/configure-habit?habitId=${h.id}&habitName=${encodeURIComponent(h.nombre)}`)
            }
          >
            <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
              <Ionicons name="bulb-outline" size={32} color={colors.accent} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>{h.nombre}</Text>
              {h.descripcion && (
                <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>{h.descripcion}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* ------------------ MODAL HÁBITO ACTUAL ------------------ */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeHabitModal}
        >
          <View style={[styles.modalBackground]}>
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedHabit?.nombre}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
                {selectedHabit?.descripcion || "Sin descripción"}
              </Text>

              <Text style={[styles.modalLabel, { color: colors.subtext }]}>
                Frecuencia: {selectedHabit?.frecuencia || "-"}
              </Text>
              <Text style={[styles.modalLabel, { color: colors.subtext }]}>
                Meta: {selectedHabit?.meta || "-"}
              </Text>
              {selectedHabit?.hora_objetivo && (
                <Text style={[styles.modalLabel, { color: colors.subtext }]}>
                  Hora objetivo: {selectedHabit.hora_objetivo}
                </Text>
              )}
              {selectedHabit?.dias_semana && (
                <Text style={[styles.modalLabel, { color: colors.subtext }]}>
                  Días: {selectedHabit.dias_semana}
                </Text>
              )}
              {selectedHabit?.notas && (
                <Text style={[styles.modalLabel, { color: colors.subtext }]}>
                  Notas: {selectedHabit.notas}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.accent }]}
                onPress={closeHabitModal}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    marginBottom: 10,
  },
  card: {
    width: "100%",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
