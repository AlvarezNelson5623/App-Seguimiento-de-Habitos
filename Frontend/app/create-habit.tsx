import React, { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ThemeContext } from "./_layout";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { API_URL } from "../config/api"; 

export default function CreateHabitScreen() {
  const { isDark } = useContext(ThemeContext);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");

  // Colores consistentes con el Home
  const colors = {
    background: isDark ? "#0D0D0D" : "#F4F7FE",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#9CA3AF" : "#6B7280",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    inputBg: isDark ? "#1F2937" : "#FFFFFF",
    border: isDark ? "#374151" : "#E5E7EB",
    accent: isDark ? "#3B82F6" : "#2563EB",
    cancel: isDark ? "#4B5563" : "#D1D5DB",
    buttonText: "#FFFFFF",
  };

  //const userId 
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id); // AQUI OBTIENE EL ID REAL DEL LOGIN
      }
    };
    loadUser();
  }, []);

  const createHabit = async () => {
    if (!nombre.trim()) {
      return Alert.alert("Error", "El nombre del hábito es obligatorio.");
    }

    try {
      const res = await fetch(`${API_URL}/habitos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          categoria,
          creado_por: userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Éxito", "Hábito creado correctamente.");

        // Reset inputs
        setNombre("");
        setDescripcion("");
        setCategoria("");

        // Redirigir a /habits
        router.push("/(tabs)/habits");
      } else {
        Alert.alert("Error", data.message || "No se pudo crear el hábito.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Crear nuevo hábito</Text>

      {/* Nombre */}
      <Text style={[styles.label, { color: colors.subtext }]}>Nombre *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
        placeholder="Ej: Beber agua"
        placeholderTextColor={colors.subtext}
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Descripción */}
      <Text style={[styles.label, { color: colors.subtext }]}>Descripción</Text>
      <TextInput
        style={[styles.textarea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
        placeholder="Describe el hábito..."
        placeholderTextColor={colors.subtext}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      {/* Categoría */}
      <Text style={[styles.label, { color: colors.subtext }]}>Categoría</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
        placeholder="Ej: Salud, Productividad..."
        placeholderTextColor={colors.subtext}
        value={categoria}
        onChangeText={setCategoria}
      />

      {/* Botón Crear */}
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={createHabit}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
        <Text style={styles.buttonText}>Crear Hábito</Text>
      </TouchableOpacity>

      {/* Botón Cancelar */}
      <TouchableOpacity
        style={[styles.buttonCancel, { backgroundColor: colors.cancel }]}
        onPress={() => router.push("/(tabs)/habits")}
      >
        <Ionicons name="close-circle-outline" size={22} color={isDark ? "#FFF" : "#111"} />
        <Text style={[styles.cancelText, { color: isDark ? "#FFF" : "#111" }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    paddingTop: 70,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    fontSize: 16,
  },
  textarea: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    height: 110,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonCancel: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
