import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  Alert,
  PanResponder,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../_layout";
import { useRouter } from "expo-router";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// INTERFAZ DEL HÁBITO
// =========================
interface Habit {
  id: number;
  nombre: string;
  descripcion?: string;
  frecuencia?: string;
  meta?: string;
  hora_objetivo?: string;
  dias_semana?: string;
  notas?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// bottom sheet height (40% pantalla)
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function HabitsScreen() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();

  const [habitosActuales, setHabitosActuales] = useState<Habit[]>([]);
  const [habitosRecomendados, setHabitosRecomendados] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // selected habit + bottom sheet visible flag
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones nativas
  const listAnim = useRef(new Animated.Value(0)).current; // entrada en cascada
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // posición Y del sheet
  const backdropAnim = useRef(new Animated.Value(0)).current; // opacidad backdrop

  // pan responder for drag down to close
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_, gestureState) => {
        // allow only downward drag
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose =
          gestureState.dy > BOTTOM_SHEET_HEIGHT * 0.3 || gestureState.vy > 1;
        if (shouldClose) {
          closeSheet();
        } else {
          // snap back
          Animated.timing(pan, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Cargar ID usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserId(parsed.id);
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.log("Error leyendo userData:", err);
        setUserId(null);
      }
    };
    loadUser();
  }, []);

  // fetch habits cuando userId esté listo
  useEffect(() => {
    if (userId !== null) fetchHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // entrada en cascada cuando termina loading
  useEffect(() => {
    if (!loading) {
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      listAnim.setValue(0);
    }
  }, [loading, habitosActuales, habitosRecomendados, listAnim]);

  // colores segun tema
  const colors = {
    background: isDark ? "#0B0C0D" : "#F6F8FB",
    text: isDark ? "#F5F7FA" : "#0A0A0A",
    subtext: isDark ? "#AEB3BB" : "#59626C",
    accent: isDark ? "#6BB1FF" : "#3A7BFF",
    surface: isDark ? "#0F1113" : "#FFFFFF",
    border: isDark ? "#1E2226" : "#E6EDF8",
    danger: "#D9534F",
  };

  // abrir el bottom sheet con un hábito seleccionado
  const openSheet = (habit: Habit) => {
    setSelectedHabit(habit);
    setSheetOpen(true);
    pan.setValue(0); // reset pan
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT - BOTTOM_SHEET_HEIGHT,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(pan, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetOpen(false);
      setSelectedHabit(null);
      if (cb) cb();
    });
  };

  // =========================
  // FUNCIÓN PARA CARGAR HÁBITOS
  // =========================
  const fetchHabits = async () => {
    if (!userId) return setLoading(false);

    try {
      setLoading(true);
      const [resActuales, resRecomendados] = await Promise.all([
        fetch(`${API_URL}/habitos/usuario/${userId}`),
        fetch(`${API_URL}/habitos/recomendados/${userId}`),
      ]);

      const actuales = resActuales.ok ? await resActuales.json() : [];
      const recomendados = resRecomendados.ok ? await resRecomendados.json() : [];

      setHabitosActuales(Array.isArray(actuales) ? actuales : []);
      setHabitosRecomendados(Array.isArray(recomendados) ? recomendados : []);
    } catch (err) {
      console.error("Error cargando hábitos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  // Eliminar hábito (desde sheet)
  const handleDeleteHabit = async (habitId?: number) => {
    if (!habitId || !userId) return;
    Alert.alert(
      "Eliminar hábito",
      "¿Estás seguro de que quieres eliminar este hábito?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_URL}/usuarios-habitos/eliminar/${userId}/${habitId}`,
                { method: "DELETE" }
              );
              const data = await res.json();
              if (data && (data.success || data.affectedRows > 0)) {
                // cerrar sheet y recargar
                closeSheet(() => fetchHabits());
              } else {
                Alert.alert("Error", "No se pudo eliminar el hábito");
              }
            } catch (error) {
              console.error("Error eliminando hábito:", error);
              Alert.alert("Error", "Error eliminando hábito");
            }
          },
        },
      ]
    );
  };

  // navegar a editar/configurar (solo si id existe)
  const goToConfigure = (habitId?: number) => {
    if (!habitId) return;
    // usamos configure-habit que sí existe en tu app
    router.push(`/configure-habit?habitId=${habitId}`);
  };

  // helpers para animación en lista (stagger)
  const getItemStyle = (index: number) => {
    const translateY = listAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18 + index * 6, 0],
    });
    const opacity = listAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    return { transform: [{ translateY }], opacity };
  };

  // estado inicial de carga / sin user
  if (loading && userId === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconBg, { backgroundColor: `${colors.accent}20` }]}>
            <Ionicons name="pulse-outline" size={22} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Hábitos</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
              Organiza tu rutina — progreso, recomendaciones y acciones
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/create-habit")}
        >
          <Ionicons name="add" size={20} color={"#fff"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HÁBITOS ACTIVOS */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos actuales</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
        ) : habitosActuales.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={42} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No tienes hábitos activos aún
            </Text>
            <TouchableOpacity
              style={[styles.ghostButton, { borderColor: colors.border }]}
              onPress={() => router.push("/create-habit")}
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>Crear hábito</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habitosActuales.map((h, i) => {
            const animatedStyle = getItemStyle(i);
            return (
              <Animated.View
                key={h.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, shadowColor: colors.text },
                  animatedStyle,
                ]}
              >
                <Pressable
                  onPress={() => openSheet(h)}
                  style={({ pressed }) => [
                    styles.cardInner,
                    { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] },
                  ]}
                >
                  <View style={styles.cardLeft}>
                    <View style={[styles.avatar, { backgroundColor: `${colors.accent}18` }]}>
                      <Ionicons name="checkmark-done" size={20} color={colors.accent} />
                    </View>

                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {h.nombre}
                      </Text>
                      {h.descripcion ? (
                        <Text style={[styles.cardSubtitle, { color: colors.subtext }]} numberOfLines={2}>
                          {h.descripcion}
                        </Text>
                      ) : (
                        <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>Sin descripción</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    {h.frecuencia ? (
                      <View style={[styles.badge, { borderColor: colors.border }]}>
                        <Text style={{ color: colors.subtext, fontSize: 12 }}>{h.frecuencia}</Text>
                      </View>
                    ) : null}
                    <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}

        {/* RECOMENDADOS */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 22 }]}>Recomendados</Text>

        {habitosRecomendados.length === 0 ? (
          <Text style={[styles.helperText, { color: colors.subtext }]}>No hay recomendaciones por ahora.</Text>
        ) : (
          habitosRecomendados.map((h, i) => {
            const animatedStyle = getItemStyle(i + 6);
            return (
              <Animated.View
                key={h.id}
                style={[
                  styles.recoCard,
                  { backgroundColor: colors.surface, shadowColor: colors.text },
                  animatedStyle,
                ]}
              >
                <Pressable
                  onPress={() => router.push(`/configure-habit?habitId=${h.id}&habitName=${encodeURIComponent(h.nombre)}`)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.997 : 1 }] }]}
                >
                  <View style={styles.recoInner}>
                    <View style={[styles.recoLeft, { backgroundColor: `${colors.accent}12` }]}>
                      <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                    </View>

                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.recoTitle, { color: colors.text }]} numberOfLines={1}>{h.nombre}</Text>
                      <Text style={[styles.recoSubtitle, { color: colors.subtext }]} numberOfLines={2}>
                        {h.descripcion ?? "Sugerencia"}
                      </Text>
                    </View>

                    <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* BACKDROP */}
      <Animated.View
        pointerEvents={sheetOpen ? "auto" : "none"}
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
            backgroundColor: "rgba(0,0,0,0.45)",
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={() => closeSheet()} />
      </Animated.View>

      {/* BOTTOM SHEET */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY: Animated.add(
                  sheetAnim,
                  pan
                ),
              },
            ],
            // make sure sheet has proper background color depending on theme
            backgroundColor: colors.surface,
            shadowColor: colors.text,
          },
        ]}
      >
        {/* handle */}
        <View style={styles.sheetHandleWrap}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        </View>

        {/* sheet content */}
        <View style={styles.sheetBody}>
          <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={1}>
            {selectedHabit?.nombre ?? ""}
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.subtext }]}>
            {selectedHabit?.descripcion ?? "Sin descripción"}
          </Text>

          <View style={styles.sheetRow}>
            {selectedHabit?.frecuencia && (
              <View style={[styles.sheetBadge, { borderColor: colors.border }]}>
                <Text style={{ color: colors.subtext }}>{selectedHabit.frecuencia}</Text>
              </View>
            )}
            {selectedHabit?.hora_objetivo && (
              <Text style={[styles.sheetInfo, { color: colors.subtext }]}>⏰ {selectedHabit.hora_objetivo}</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            {selectedHabit?.meta && <Text style={[styles.sheetLabel, { color: colors.subtext }]}>Meta: {selectedHabit.meta}</Text>}
            {selectedHabit?.dias_semana && <Text style={[styles.sheetLabel, { color: colors.subtext }]}>Días: {selectedHabit.dias_semana}</Text>}
            {selectedHabit?.notas && <Text style={[styles.sheetLabel, { color: colors.subtext }]}>Notas: {selectedHabit.notas}</Text>}
          </View>

          <View style={{ marginTop: 18 }}>
            <TouchableOpacity
              style={[styles.sheetPrimaryBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                // navegar a configurar/editar solo si ID existe
                if (selectedHabit?.id) {
                  closeSheet(() => goToConfigure(selectedHabit.id));
                }
              }}
            >
              <Text style={styles.sheetPrimaryText}>Editar hábito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetDestructiveBtn]}
              onPress={() => handleDeleteHabit(selectedHabit?.id)}
            >
              <Text style={[styles.sheetDestructiveText]}>Eliminar hábito</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sheetGhostBtn]} onPress={() => closeSheet()}>
              <Text style={[styles.sheetGhostText]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" , marginTop: 20 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  // EMPTY
  emptyBox: {
    marginTop: 12,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  emptyText: { fontSize: 15 },
  ghostButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  // CARD (ACTUALES)
  card: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    // shadow default
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { fontSize: 13, marginTop: 4 },

  cardRight: { alignItems: "flex-end", justifyContent: "center" },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },

  // RECOMMENDED
  recoCard: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 2,
  },
  recoInner: { flexDirection: "row", alignItems: "center" },
  recoLeft: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recoTitle: { fontSize: 15, fontWeight: "700" },
  recoSubtitle: { fontSize: 13, marginTop: 3 },
  helperText: { fontSize: 14, marginTop: 6 },

  // BACKDROP
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
  },

  // SHEET
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    height: BOTTOM_SHEET_HEIGHT,
    borderRadius: 14,
    elevation: 10,
    zIndex: 9,
    overflow: "hidden",
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 64,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#E6EDF8",
  },
  sheetBody: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  sheetRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  sheetBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sheetInfo: {
    marginLeft: 8,
    fontSize: 13,
  },
  sheetLabel: {
    fontSize: 14,
    marginTop: 6,
    color: "#666",
  },

  sheetPrimaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetPrimaryText: { color: "#fff", fontWeight: "700" },

  sheetDestructiveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F8ECEA",
  },
  sheetDestructiveText: { color: "#D9534F", fontWeight: "800" },

  sheetGhostBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E6EDF8",
  },
  sheetGhostText: { color: "#6B6B6B", fontWeight: "700" },

  // helper buttons
  ghostBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },

});
