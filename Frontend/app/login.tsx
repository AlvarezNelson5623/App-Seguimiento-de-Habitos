import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemeContext } from "./_layout";
import { login } from "../services/authService";

// 🖼️ Imágenes de tema claro/oscuro
import logoLight from "./assets/logo.png";
import logoDark from "./assets/logo2.png";
import backgroundImageDark from "./assets/imageBackground.png";
import backgroundImageLight from "./assets/imageBackground2.png";





export default function LoginScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const isDarkMode = isDark ?? systemColorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "success">("idle");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleLogin = async () => {
    setMessage(null);
    setStatus("checking");

    if (!email || !password) {
      setStatus("idle");
      return setMessage({ text: "❌ Todos los campos son obligatorios", type: "error" });
    }

    try {
      const response = await login(email, password);
      console.log("Respuesta del backend:", response);

      setStatus("success");
      setMessage({ text: "✅ Inicio de sesión exitoso", type: "success" });

      // Aquí podrías guardar el token si tu backend lo devuelve:
      // await AsyncStorage.setItem("token", response.token);

      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 1500);
    } catch (error: any) {
      setStatus("idle");
      setMessage({ text: `❌ ${error.message || "Error al iniciar sesión"}`, type: "error" });
    }
  };

  return (
    <ImageBackground
      source={isDarkMode ? backgroundImageDark : backgroundImageLight}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* ☀️🌙 Botón de tema */}
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Feather
                name={isDarkMode ? "sun" : "moon"}
                size={28}
                color={isDarkMode ? "#FFA500" : "#4b4b4b"}
              />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                padding: 24,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo */}
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
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                    color: isDarkMode ? "#fff" : "#000",
                    borderColor: isDarkMode ? "#555" : "#ccc",
                  },
                ]}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
              />

              {/* Contraseña */}
              <View style={{ position: "relative", marginBottom: 20 }}>
                <TextInput
                  placeholder="Contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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
                    size={22}
                    color={isDarkMode ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              {/* Botón login */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={status === "checking"}
                style={[
                  styles.loginButton,
                  { backgroundColor: status === "checking" ? "#888" : "#6200EE" },
                ]}
              >
                {status === "checking" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Mensaje */}
              {message && (
                <Text
                  style={[
                    styles.message,
                    { color: message.type === "error" ? "#cf6679" : "lightgreen" },
                  ]}
                >
                  {message.text}
                </Text>
              )}

              {/* Link registro */}
              <TouchableOpacity
                style={{ marginTop: 16 }}
                onPress={() => router.replace("/registro")}
              >
                <Text
                  style={{
                    color: isDarkMode ? "#fff" : "#6200EE",
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  ¿No tienes cuenta? Regístrate
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
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
  message: {
    marginTop: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
});
