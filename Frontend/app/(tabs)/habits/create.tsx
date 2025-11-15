import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  addCustomHabit,
  addExistingHabit,
  getGlobalHabits,
} from "../../../services/habitsService";
import { ThemeContext } from "../../_layout";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);

  const [globalHabits, setGlobalHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [habitName, setHabitName] = useState("");

  const userId = 1; // temporal

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await getGlobalHabits();
      setGlobalHabits(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleCreateCustomHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Error", "El nombre del hábito no puede estar vacío.");
      return;
    }

    try {
      await addCustomHabit({ name: habitName, userId });
      Alert.alert("Éxito", "Hábito personalizado creado.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAssignExisting = async (habitId: number) => {
    try {
      await addExistingHabit(userId, habitId);
      Alert.alert("Éxito", "Hábito asignado.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111" : "#fff" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Crear hábito personalizado
      </Text>

      <TextInput
        placeholder="Nombre del hábito"
        placeholderTextColor={isDark ? "#888" : "#999"}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#222" : "#eee",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={habitName}
        onChangeText={setHabitName}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? "#444" : "#000" },
        ]}
        onPress={handleCreateCustomHabit}
      >
        <Text style={styles.buttonText}>Crear hábito personalizado</Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.subtitle,
          { color: isDark ? "#fff" : "#000" },
        ]}
      >
        O asigna uno existente
      </Text>

      {globalHabits.map((habit: any) => (
        <TouchableOpacity
          key={habit.id}
          style={[
            styles.habitCard,
            { backgroundColor: isDark ? "#222" : "#eee" },
          ]}
          onPress={() => handleAssignExisting(habit.id)}
        >
          <Text
            style={[styles.habitName, { color: isDark ? "#fff" : "#000" }]}
          >
            {habit.name}
          </Text>
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
  },
  habitName: {
    fontSize: 18,
  },
});
