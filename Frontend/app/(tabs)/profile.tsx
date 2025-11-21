import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemeContext } from "../_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "../../config/api";

const avatarMap: Record<string, any> = {
  "pacific1.jpg": require("../assets/pacific1.jpg"),
  "pacific2.jpg": require("../assets/pacific2.jpg"),
  "pacific3.jpg": require("../assets/pacific3.jpg"),
  "pacific4.jpg": require("../assets/pacific4.jpg"),
  "pacific5.jpg": require("../assets/pacific5.jpg"),
  "pacific6.jpg": require("../assets/pacific6.jpg"),
  "Tron1.jpg": require("../assets/Tron1.jpg"),
  "Tron2.jpg": require("../assets/Tron2.jpg"),
  "Tron3.jpg": require("../assets/Tron3.jpg"),
  "starwars1.jpg": require("../assets/starwars1.jpg"),
  "starwars2.jpg": require("../assets/starwars2.jpg"),
  "starwars3.jpg": require("../assets/starwars3.jpg"),
  "deadpool.jpg": require("../assets/deadpool.jpg"),
  "deadpool and wolverine.jpg": require("../assets/deadpool and wolverine.jpg"),
  "wolverine.jpg": require("../assets/wolverine.jpg"),
  "Halo1.jpg": require("../assets/Halo1.jpg"),
  "Halo2.jpg": require("../assets/Halo2.jpg"),
  "Halo3.jpg": require("../assets/Halo3.jpg"),
};

export default function ProfileScreen() {
  const router = useRouter();
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const systemColorScheme = useColorScheme();
  const isDarkMode = isDark ?? systemColorScheme === "dark";

  const [user, setUser] = useState<{ nombre?: string; email?: string; foto_perfil?: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");
        if (data) {
          const parsed = JSON.parse(data);
          setUser(parsed);
          setNewName(parsed.nombre || "");
          setSelectedAvatar(parsed.foto_perfil || "");
        }
      } catch (error) {
        console.error("❌ Error cargando usuario:", error);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, salir",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
          router.replace("/login");
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      nombre: newName || user.nombre,
      foto_perfil: selectedAvatar || user.foto_perfil,
    };

    try {
      const response = await fetch(`${API_URL}/users/update-profile/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: updatedUser.nombre,
          foto_perfil: updatedUser.foto_perfil,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar en el servidor");
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setModalVisible(false);
      Alert.alert("✅ Perfil actualizado", "Los cambios se guardaron correctamente.");
    } catch (error) {
      console.error("❌ Error guardando perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  const avatarSource =
    user?.foto_perfil && avatarMap[user.foto_perfil]
      ? avatarMap[user.foto_perfil]
      : require("../assets/pacific1.jpg");

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#0D0D0D" : "#F5F7FB" }]}>
      {/* 🌗 Botón tema */}
      <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
        <Feather
          name={isDarkMode ? "sun" : "moon"}
          size={28}
          color={isDarkMode ? "#FFD369" : "#333"}
        />
      </TouchableOpacity>

      {/* Avatar con borde brillante */}
      <View style={styles.avatarWrapper}>
        <Image source={avatarSource} style={styles.avatar} />
      </View>

      <Text style={[styles.username, { color: isDarkMode ? "#fff" : "#111" }]}>
        {user?.nombre || "Usuario"}
      </Text>

      <Text style={[styles.email, { color: isDarkMode ? "#aaa" : "#555" }]}>
        {user?.email}
      </Text>

      {/* Botonera */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? "#1C1C1E" : "#fff",
            shadowColor: isDarkMode ? "#000" : "#B0B0B0",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3A6DFF" }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF4D4D" }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* 🪟 Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: isDarkMode ? "#1C1C1E" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#111" }]}>
              Editar perfil
            </Text>

            <TextInput
              style={[
                styles.input,
                { color: isDarkMode ? "#fff" : "#000", borderColor: "#3A6DFF" },
              ]}
              placeholder="Nuevo nombre"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={[styles.subTitle, { color: isDarkMode ? "#fff" : "#111" }]}>
              Selecciona tu avatar:
            </Text>

            <FlatList
              data={Object.keys(avatarMap)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedAvatar(item)}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === item && { borderColor: "#3A6DFF", borderWidth: 3 },
                  ]}
                >
                  <Image source={avatarMap[item]} style={styles.avatarImage} />
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#3A6DFF", flex: 1 }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#888", flex: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  themeButton: { position: "absolute", top: 50, right: 25 },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: "#3A6DFF",
    borderRadius: 100,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 25,
  },
  card: {
    width: "85%",
    padding: 25,
    borderRadius: 18,
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  subTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  avatarOption: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80, borderRadius: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});
