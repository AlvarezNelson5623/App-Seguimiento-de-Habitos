import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/theme";
import { ThemeContext } from "../_layout";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { toggleTheme, isDark } = useContext(ThemeContext);

  const [avatar, setAvatar] = useState(require("../assets/pacific1.jpg"));
  const [modalVisible, setModalVisible] = useState(false);

  const avatars = [
    require("../assets/pacific1.jpg"),
    require("../assets/pacific2.jpg"),
    require("../assets/pacific3.jpg"),
    require("../assets/pacific4.jpg"),
    require("../assets/pacific5.jpg"),
    require("../assets/pacific6.jpg"),
    require("../assets/Tron1.jpg"),
    require("../assets/Tron2.jpg"),
    require("../assets/Tron3.jpg"),
    require("../assets/starwars1.jpg"),
    require("../assets/starwars2.jpg"),
    require("../assets/starwars3.jpg"),
    require("../assets/deadpool.jpg"),
    require("../assets/deadpool and wolverine.jpg"),
    require("../assets/wolverine.jpg"),
    require("../assets/Halo1.jpg"),
    require("../assets/Halo2.jpg"),
    require("../assets/Halo3.jpg"),
  ];

  const handleAvatarSelect = (newAvatar: any) => {
    setAvatar(newAvatar);
    setModalVisible(false);
  };

  const handleLogout = () => {
    alert("Sesión cerrada ✅");
  };

  const pickImageFromDevice = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Se necesita permiso para acceder a tus fotos 📸");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar({ uri: result.assets[0].uri });
      setModalVisible(false);
    }
  };

  // 👉 Usa el tema actual del contexto, no el del sistema
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Imagen de perfil */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={avatar} style={styles.avatar} />
      </TouchableOpacity>

      {/* Nombre y frase */}
      <Text style={[styles.name, { color: themeColors.text }]}>Usuario</Text>
      <Text style={[styles.motivational, { color: themeColors.tint }]}>
        “¡Hoy es un gran día para mejorar tus hábitos!”
      </Text>

      {/* Botón de tema */}
      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Ionicons
          name={isDark ? "sunny-outline" : "moon-outline"}
          size={22}
          color="white"
        />
        <Text style={styles.buttonText}>
          {isDark ? "Modo claro" : "Modo oscuro"}
        </Text>
      </TouchableOpacity>

      {/* Botón de logout */}
      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Modal de selección de avatar */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu avatar</Text>

            <FlatList
              data={[...avatars, "addButton"]}
              numColumns={3}
              renderItem={({ item }) =>
                item === "addButton" ? (
                  <TouchableOpacity onPress={pickImageFromDevice}>
                    <View style={styles.addButton}>
                      <Ionicons name="add" size={40} color="white" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                    <Image source={item} style={styles.modalAvatarGrid} />
                  </TouchableOpacity>
                )
              }
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.avatarGridContainer}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeModal}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  motivational: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A6DFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  logout: {
    backgroundColor: "#D9534F",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  avatarGridContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvatarGrid: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    backgroundColor: "#3A6DFF",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModal: {
    backgroundColor: "#3A6DFF",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
});
