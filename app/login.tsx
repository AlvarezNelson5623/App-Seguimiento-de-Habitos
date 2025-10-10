import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { login } from "../firebase/authService";
import { useRouter } from "expo-router";
import { ThemeContext } from "./_layout";
import { Feather } from "@expo/vector-icons";

import logoLight from "./assets/logo.png";
import logoDark from "./assets/logo2.png";

const LoginScreen = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const isDarkMode = isDark ?? systemColorScheme === "dark";

  const handleLogin = async () => {
    if (!userIdentifier || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await login(userIdentifier, password);
      setError(null);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Feather
              name={isDarkMode ? "sun" : "moon"}
              size={28}
              color={isDarkMode ? "#FFA500" : "#4b4b4b"}
            />
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={isDarkMode ? logoDark : logoLight}
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />
          </View>

          <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>
            Iniciar Sesión
          </Text>

          {/* Correo */}
          <TextInput
            placeholder="Correo"
            value={userIdentifier}
            onChangeText={setUserIdentifier}
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
                borderColor: isDarkMode ? "#555" : "#ccc",
              },
            ]}
            autoCapitalize="none"
            placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
          />

          {/* Contraseña */}
          <View style={{ position: "relative", marginBottom: 20 }}>
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  borderColor: isDarkMode ? "#555" : "#ccc",
                },
              ]}
              placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: "#6200EE" }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.push("/registro")}
          >
            <Text
              style={{
                color: isDarkMode ? "#fff" : "#6200EE",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              Registrarse
            </Text>
          </TouchableOpacity>

          {error && <Text style={[styles.error, { color: "#cf6679" }]}>{error}</Text>}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  showButton: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  error: {
    marginTop: 12,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
});

export default LoginScreen;
