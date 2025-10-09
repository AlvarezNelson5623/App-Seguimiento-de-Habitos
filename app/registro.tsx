import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, useColorScheme, Alert, TouchableOpacity } from "react-native";
import { register, login } from "../firebase/authService";
import { addUsernameToFirestore } from "../firebase/userService"; 
import { useNavigation } from "@react-navigation/native";

const RegistroScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Validación de correo
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Ingresa un correo válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      // Registrar en Firebase Auth
      await register(email, password);

      // Guardar nombre en Firestore
      await addUsernameToFirestore(name, email);

      // Login automático
      await login(email, password);

      setError(null);

      // Redirigir a Tabs
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }], // Asegúrate de que tu ruta de tabs se llame "Tabs"
      });

    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f2f2f2" }]}>
      <TextInput
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        style={[styles.input, {
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          borderColor: isDarkMode ? "#555" : "#ccc",
        }]}
        placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
      />

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, {
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          borderColor: isDarkMode ? "#555" : "#ccc",
        }]}
        autoCapitalize="none"
        placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
      />

      <View style={{ position: "relative" }}>
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
            borderColor: isDarkMode ? "#555" : "#ccc",
          }]}
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
        />
        <TouchableOpacity
          style={styles.showButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={{ color: isDarkMode ? "#BB86FC" : "#6200EE" }}>
            {showPassword ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Registrarse"
        onPress={handleRegister}
        color={isDarkMode ? "#BB86FC" : "#6200EE"}
      />

      {error && <Text style={[styles.error, { color: "#cf6679" }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  input: { borderWidth: 1, marginBottom: 12, padding: 12, borderRadius: 8 },
  error: { marginTop: 8, fontWeight: "bold", textAlign: "center" },
  showButton: {
    position: "absolute",
    right: 10,
    top: 12,
  },
});

export default RegistroScreen;
