import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { register } from "../services/authService"; // 🔥 tu backend con SQL
import { ThemeContext } from "./_layout";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import logoLight from "./assets/logo.png";
import logoDark from "./assets/logo2.png";

const RegistroScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "success">("idle");

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { isDark } = useContext(ThemeContext);
  const isDarkMode = isDark ?? systemColorScheme === "dark";

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async () => {
    setMessage(null);
    setStatus("checking");

    if (!name || !email || !password) {
      setStatus("idle");
      return setMessage({ text: "❌ Todos los campos son obligatorios", type: "error" });
    }
    if (!isValidEmail(email)) {
      setStatus("idle");
      return setMessage({ text: "❌ Ingresa un correo válido", type: "error" });
    }
    if (password.length < 6) {
      setStatus("idle");
      return setMessage({
        text: "❌ La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
    }

    try {
      const response = await register(name, email, password);
      console.log("Respuesta del backend:", response);

      setStatus("success");
      setMessage({ text: "✅ Registro exitoso", type: "success" });

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error en registro:", error);
      setStatus("idle");
      setMessage({ text: `❌ ${error.message || "Error en el registro"}`, type: "error" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Image
            source={isDarkMode ? logoDark : logoLight}
            style={{ width: 120, height: 120, resizeMode: "contain" }}
          />
        </View>

        <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>
          ¡Vamos a ello!
        </Text>

        <TextInput
          ref={nameInputRef}
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#555" : "#ccc",
            },
          ]}
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current?.focus()}
        />

        <TextInput
          ref={emailInputRef}
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
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <View style={{ position: "relative", marginBottom: 20 }}>
          <TextInput
            ref={passwordInputRef}
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
            returnKeyType="done"
            onSubmitEditing={handleRegister}
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
          style={[styles.registerButton, { backgroundColor: "#6200EE" }]}
          onPress={handleRegister}
          disabled={status === "checking"}
        >
          {status === "checking" ? (
            <Feather name="check" size={24} color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {message && (
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 16,
              color: message.type === "success" ? "#4CAF50" : "#E53935",
            }}
          >
            {message.text}
          </Text>
        )}

        <TouchableOpacity onPress={() => router.replace("/login")} style={{ marginTop: 30 }}>
          <Text
            style={{
              textAlign: "center",
              color: isDarkMode ? "#BB86FC" : "#6200EE",
              fontWeight: "600",
            }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
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
  },
  showButton: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default RegistroScreen;
