import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {ScrollView,StyleSheet,TouchableOpacity,View,Alert,} from "react-native";
import {useLayoutEffect,useState,useEffect,useContext,} from "react";
import { useNavigation } from "expo-router";
import { ThemeContext } from "../_layout";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Habit {
  usuario_habito_id: number;
  id: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  frecuencia: string;
  meta: number;
  hora_objetivo?: string;
  dias_semana?: string | null;
  notas?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
}

export default function InicioScreen() {
  const navigation = useNavigation();
  const { isDark } = useContext(ThemeContext);

  const colors = {
    background: isDark ? "#0E1116" : "#F4F6FB",
    text: isDark ? "#FFFFFF" : "#0B0B0B",
    subtext: isDark ? "#B0B0B0" : "#6B6B6B",
    accent: isDark ? "#3A6DFF" : "#007AFF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    surfaceAlt: isDark ? "#2A2A2A" : "#F8F9FB",
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [currentDate] = useState(new Date()); // hoy real
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [weekDays, setWeekDays] = useState<{ day: string; date: Date }[]>(
    []
  );
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // map para registros: usuario_habito_id -> realizado (0/1) o null
  const [registrosMap, setRegistrosMap] = useState<Record<number, number | null>>(
    {}
  );

  // Cargar ID usuario
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id);
      }
    };
    loadUser();
  }, []);

  // Cargar hábitos del usuario desde la BD
  const loadHabits = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/habitos/usuario/${userId}`);
      const data = await response.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error cargando hábitos:", err);
    }
  };

  // Cargar registros para la fecha seleccionada (optimizado: trae estado por cada habit)
  const loadRegistrosForSelectedDate = async () => {
    if (!userId) return;

    const fecha = selectedDate.toISOString().split("T")[0];
    const map: Record<number, number | null> = {};

    try {
      // iteramos sobre los hábitos filtrados para pedir estado individual
      // (podrías crear un endpoint que devuelva todos los registros de un usuario para una fecha)
      const promises = filteredHabits.map(async (h) => {
        const res = await fetch(
          `${API_URL}/registros-habitos/estado/${h.usuario_habito_id}?fecha=${fecha}`
        );
        const data = await res.json();
        // ruta devuelve { realizado: null } o { realizado: 0/1 } (según  backend)
        if (Array.isArray(data) && data.length > 0) {
          // si backend devolviera array
          map[h.usuario_habito_id] =
            data[0] && data[0].realizado != null ? Number(data[0].realizado) : null;
        } else if (data && typeof data.realizado !== "undefined") {
          map[h.usuario_habito_id] =
            data.realizado != null ? Number(data.realizado) : null;
        } else {
          map[h.usuario_habito_id] = null;
        }
      });

      await Promise.all(promises);
      setRegistrosMap(map);
    } catch (err) {
      console.log("Error cargando registros por fecha:", err);
    }
  };

  // Recargar hábitos cuando cambie usuario o se elimine un hábito asignado
useFocusEffect(
  useCallback(() => {
    if (userId) {
      loadHabits();
    }
  }, [userId])
);

  // Generar días de la semana (para la 'cinta' del calendario)
  useEffect(() => {
    const days: { day: string; date: Date }[] = [];
    const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({ day: dayNames[i], date: d });
    }
    setWeekDays(days);
  }, [weekStart]);

  // Filtrar hábitos cada vez que cambie la lista o la fecha seleccionada
  useEffect(() => {
    setFilteredHabits(filterHabitsByDate(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, selectedDate]);

  // Cuando filteredHabits cambie (o fecha) cargamos registros
  useEffect(() => {
    if (filteredHabits.length > 0) loadRegistrosForSelectedDate();
    else setRegistrosMap({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHabits, selectedDate]);

  // Función para filtrar según fecha seleccionada (usa fecha_inicio + meta y 'diario')
  function filterHabitsByDate(date: Date) {
    if (!habits || habits.length === 0) return [];

    return habits.filter((h) => {
      const start = new Date(h.fecha_inicio);
      const metaDays = h.meta ?? 1;

      const end = new Date(start);
      end.setDate(start.getDate() + metaDays - 1);

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return d >= start && d <= end;
    });
  }

  // Marcar hábito como realizado (POST)
  const marcarHabito = async (usuario_habito_id: number) => {
    try {
      const fecha = selectedDate.toISOString().split("T")[0];

      await fetch(`${API_URL}/registros-habitos/marcar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_habito_id,
          fecha,
        }),
      });

      // recargar estado del registro para reflejar cambio
      setRegistrosMap((prev) => ({ ...prev, [usuario_habito_id]: 1 }));
    } catch (error) {
      console.error("Error marcando hábito:", error);
      Alert.alert("Error", "No se pudo marcar el hábito. Intenta de nuevo.");
    }
  };

  // Calcular inicio de semana (domingo)
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const diff = d.getDate() - d.getDay();
    return new Date(d.setDate(diff));
  }

  const changeWeek = (direction: "prev" | "next") => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newStart);
    // además, si te mueves de semana, seleccionamos el primer día visible por defecto
    const firstDay = new Date(newStart);
    setSelectedDate(firstDay);
  };

  // Formatea etiquetas Hoy/Mañana/Ayer 
  function getDateInfo(selected: Date, current: Date) {
    const sel = new Date(selected);
    const cur = new Date(current);
    sel.setHours(0, 0, 0, 0);
    cur.setHours(0, 0, 0, 0);

    const diffDays = (sel.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24);

    const dayNames = [
      "domingo","lunes","martes","miércoles","jueves","viernes","sábado",
    ];
    const monthNames = [
      "ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic",
    ];

    if (diffDays === 0) return { label: "Hoy", subLabel: "" };
    if (diffDays === 1) return { label: "Mañana", subLabel: "" };
    if (diffDays === -1) return { label: "Ayer", subLabel: "" };

    return {
      label: `${selected.getDate()} ${monthNames[selected.getMonth()]}`,
      subLabel: dayNames[selected.getDay()],
    };
  }

  const formattedDateInfo = getDateInfo(selectedDate, currentDate);

  // Helper para comparar días
  const isSameDay = (a: Date, b: Date) => {
    const x = new Date(a);
    const y = new Date(b);
    x.setHours(0, 0, 0, 0);
    y.setHours(0, 0, 0, 0);
    return x.getTime() === y.getTime();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText
          type="title"
          style={[styles.headerTitle, { color: colors.text }]}
        >
          {formattedDateInfo.label}
        </ThemedText>
        <ThemedText
          type="default"
          style={[styles.headerSubtitle, { color: colors.subtext }]}
        >
          {formattedDateInfo.subLabel}
        </ThemedText>
      </View>

      {/* Calendario (cinta semanal) */}
      <View style={[styles.calendarRow, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => changeWeek("prev")}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScroll}
        >
          {weekDays.map((item, i) => {
            const isSelected = isSameDay(item.date, selectedDate);
            const isTodayDay = isSameDay(item.date, currentDate);

            // Estilo: si es seleccionado → fondo accent (tu estilo original)
            // Si es HOY pero NO seleccionado → borde / color acento atenuado para que el user vea volver a hoy (opción A)
            const dayStyle = [
              styles.day,
              isSelected && { backgroundColor: colors.accent },
              !isSelected && isTodayDay && { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
            ];

            return (
              <TouchableOpacity
                key={i}
                style={dayStyle}
                onPress={() => {
                  setSelectedDate(item.date);
                }}
              >
                <ThemedText style={[styles.dayText, { color: isSelected ? "#fff" : colors.subtext }]}>
                  {item.day}
                </ThemedText>
                <ThemedText style={[styles.dayDate, { color: isSelected ? "#fff" : colors.text }]}>
                  {item.date.getDate()}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={() => changeWeek("next")}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* HÁBITOS ACTIVOS */}
      <ScrollView style={styles.habitsContainer}>
        {filteredHabits.length > 0 ? (
          filteredHabits.map((h, i) => {
            const estado = registrosMap[h.usuario_habito_id]; // 1 = realizado, 0 = no, null = no marcado
            return (
              <Animated.View
                key={h.id}
                entering={FadeInUp.duration(400).delay(80 * i)}
                style={[
                  styles.habitCard,
                  { backgroundColor: colors.surface, borderColor: colors.accent },
                ]}
              >
                <Ionicons name="checkmark-circle-outline" size={25} color={colors.accent} />
                <ThemedText style={[styles.habitText, { color: colors.text }]}>
                  {h.nombre}
                </ThemedText>

                {/* Si es hoy → checkbox / acción */}
                {isSameDay(selectedDate, currentDate) ? (
                  estado === 1 ? (
                    <ThemedText style={{ color: "#4CAF50", fontWeight: "700" }}>✔ Cumplido</ThemedText>
                  ) : (
                    <TouchableOpacity onPress={() => marcarHabito(h.usuario_habito_id)}>
                      <Ionicons name="square-outline" size={28} color={colors.accent} />
                    </TouchableOpacity>
                  )
                ) : (
                  // Si no es hoy → mostrar estado si existe, o ícono de 'time' si es futuro/pasado pendiente
                  estado === 1 ? (
                    <ThemedText style={{ color: "#4CAF50", fontWeight: "700" }}>✔</ThemedText>
                  ) : estado === 0 ? (
                    <ThemedText style={{ color: "#E53935", fontWeight: "700" }}>✘</ThemedText>
                  ) : (
                    <Ionicons name="time-outline" size={22} color={colors.subtext} />
                  )
                )}
              </Animated.View>
            );
          })
        ) : (
          <View style={styles.noHabitsContainer}>
            <ThemedText style={[styles.noHabitsText, { color: colors.subtext }]}>
              No tienes hábitos para esta fecha 🎉
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Botón crear hábito (conservado) */}
      <TouchableOpacity
        onPress={() => router.push("/create-habit")}
        style={[styles.addHabitButton, { backgroundColor: colors.accent }]}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <ThemedText style={[styles.addHabitText, { color: "#fff" }]}>Crear nuevo hábito</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

function getDateInfo(selected: Date, current: Date) {
  const diffDays =
    (selected.setHours(0, 0, 0, 0) - current.setHours(0, 0, 0, 0)) /
    (1000 * 60 * 60 * 24);

  const dayNames = [
    "domingo","lunes","martes","miércoles","jueves","viernes","sábado",
  ];
  const monthNames = [
    "ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic",
  ];

  if (diffDays === 0) return { label: "Hoy", subLabel: "" };
  if (diffDays === 1) return { label: "Mañana", subLabel: "" };
  if (diffDays === -1) return { label: "Ayer", subLabel: "" };

  return {
    label: `${selected.getDate()} ${monthNames[selected.getMonth()]}`,
    subLabel: dayNames[selected.getDay()],
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45, paddingHorizontal: 18 },
  header: { marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: 0.3 },
  headerSubtitle: { textTransform: "capitalize", fontSize: 16 },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  calendarScroll: { flexDirection: "row", alignItems: "center" },
  day: {
    alignItems: "center",
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 48,
    backgroundColor: "transparent",
  },
  dayText: { fontSize: 12, fontWeight: "600" },
  dayDate: { fontSize: 14, fontWeight: "700", marginTop: 2 },

  // HÁBITOS
  habitsContainer: { flex: 1 },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.3,
    marginBottom: 12,
    gap: 12,
  },
  habitText: { fontSize: 16, fontWeight: "600" },
  noHabitsContainer: { alignItems: "center", marginTop: 40 },
  noHabitsText: { fontStyle: "italic" },

  // BOTÓN
  addHabitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    elevation: 5,
  },
  addHabitText: { fontWeight: "bold", fontSize: 15, marginLeft: 6 },
});
