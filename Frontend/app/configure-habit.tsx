import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ThemeContext } from "./_layout";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ConfigureHabitScreen() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();
  const { habitId, habitName } = useLocalSearchParams();

  const [frecuencia, setFrecuencia] = useState("diario");
  const [meta, setMeta] = useState("1");
  const [hora_objetivo, setHoraObjetivo] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [notas, setNotas] = useState("");

  const [userId, setUserId] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const colors = {
    background: isDark ? "#0E0F12" : "#F4F6FA",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A7A7A7" : "#6B6B6B",
    surface: isDark ? "#181A1F" : "#FFFFFF",
    accent: isDark ? "#4C8BFF" : "#3A7BFF",
    border: isDark ? "#333" : "#DDD",
  };

  const days = [
    { label: "L", value: "lunes" },
    { label: "M", value: "martes" },
    { label: "X", value: "miércoles" },
    { label: "J", value: "jueves" },
    { label: "V", value: "viernes" },
    { label: "S", value: "sábado" },
    { label: "D", value: "domingo" },
  ];

  const toggleDia = (dia: string) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const saveHabit = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios-habitos/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          habito_id: Number(habitId),
          frecuencia,
          meta: Number(meta),
          hora_objetivo,
          dias_semana: diasSeleccionados.join(","),
          notas,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("¡Éxito!", "Hábito agregado a tus hábitos actuales.");
        router.push("/(tabs)/habits");
      } else {
        Alert.alert("Error", data.message || "No se pudo asignar el hábito.");
      }
    } catch (err) {
      Alert.alert("Error", "Problema de conexión con el servidor.");
      console.log(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { paddingTop: 60 }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Configurar hábito
          </Text>

          <Text style={[styles.habitName, { color: colors.accent }]}>
            {habitName}
          </Text>

          {/* Frecuencia */}
          <Text style={[styles.label, { color: colors.subtext }]}>
            Frecuencia
          </Text>
          <View style={styles.row}>
            {["diario", "semanal", "mensual"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      frecuencia === f ? colors.accent : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFrecuencia(f)}
              >
                <Text
                  style={{
                    color: frecuencia === f ? "#FFF" : colors.text,
                    fontWeight: "600",
                  }}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meta */}
          <Text style={[styles.label, { color: colors.subtext }]}>
            Meta (número)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            keyboardType="numeric"
            value={meta}
            onChangeText={setMeta}
            placeholder="Ej: 8 dias, 2 semanas..."
            placeholderTextColor={colors.subtext}
          />

          {/* Hora objetivo */}
          <Text style={[styles.label, { color: colors.subtext }]}>
            Hora objetivo (opcional)
          </Text>

          <TouchableOpacity
            style={[
              styles.selectButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>
              {hora_objetivo !== "" ? hora_objetivo : "Seleccionar hora"}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              is24Hour={true}
              onChange={(event, selected) => {
                setShowTimePicker(false);
                if (selected) {
                  const hrs = selected
                    .getHours()
                    .toString()
                    .padStart(2, "0");
                  const min = selected
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                  setHoraObjetivo(`${hrs}:${min}`);
                }
              }}
            />
          )}

          {/* Días de la semana */}
          {frecuencia === "semanal" && (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>
                Días de la semana
              </Text>

              <View style={styles.daysRow}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: diasSeleccionados.includes(d.value)
                          ? colors.accent
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleDia(d.value)}
                  >
                    <Text
                      style={{
                        color: diasSeleccionados.includes(d.value)
                          ? "#fff"
                          : colors.text,
                        fontWeight: "600",
                      }}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Notas */}
          <Text style={[styles.label, { color: colors.subtext }]}>Notas</Text>
          <TextInput
            style={[
              styles.textarea,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Notas adicionales..."
            placeholderTextColor={colors.subtext}
            multiline
            value={notas}
            onChangeText={setNotas}
          />

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.accent }]}
            onPress={saveHabit}
          >
            <Ionicons name="save-outline" color="#FFF" size={20} />
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>

          {/* Cancelar */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.accent }]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingBottom: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  habitName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  selectButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textarea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    height: 100,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: 22,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 15,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
