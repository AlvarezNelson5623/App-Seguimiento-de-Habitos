import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { login } from "../firebase/authService";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleLogin = async () => {
    if (!userIdentifier || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await login(userIdentifier, password);
      setError(null);

      // ✅ Navegar a la pantalla principal /tabs después del login
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f2f2f2" }]}>
      <TextInput
        placeholder="Correo"
        value={userIdentifier}
        onChangeText={setUserIdentifier}
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
        title="Iniciar sesión"
        onPress={handleLogin}
        color={isDarkMode ? "#BB86FC" : "#6200EE"}
      />

      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.push("/registro")}>
        <Text style={{ color: isDarkMode ? "#BB86FC" : "#6200EE", textAlign: "center" }}>
          Registrarse
        </Text>
      </TouchableOpacity>

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

export default LoginScreen;
