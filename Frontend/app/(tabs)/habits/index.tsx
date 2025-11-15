// app/(tabs)/habits/index.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { getUserHabits, removeUserHabit } from "../../../services/habitsService";

export default function HabitsScreen() {
  const navigation = useNavigation();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // temporal

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await getUserHabits(userId);
      setHabits(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    try {
      await removeUserHabit(userId, habitId);
      loadHabits();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    navigation.addListener("focus", loadHabits);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {habits.map((habit: any) => (
          <View key={habit.id} style={styles.habitCard}>
            <Text style={styles.habitName}>{habit.name}</Text>

            <TouchableOpacity onPress={() => handleDeleteHabit(habit.id)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("create" as never)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "black",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
