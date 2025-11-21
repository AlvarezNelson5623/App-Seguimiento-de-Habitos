import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { LineChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function EstadisticasScreen() {
  const { isDark } = useContext(ThemeContext);

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [globalStats, setGlobalStats] = useState<any>(null);
  const [porHabito, setPorHabito] = useState<any[]>([]);
  const [mensual, setMensual] = useState<any[]>([]);

  const screenWidth = Dimensions.get("window").width - 48;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) setUserId(JSON.parse(userData).id);
      } catch (err) {
        console.log("Error cargando userData:", err);
      }
    };
    loadUser();
  }, []);

  const loadStats = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`${API_URL}/estadisticas/${userId}`);
        const text = await resp.text();

        if (!resp.ok || text.startsWith("<")) return;

        const data = JSON.parse(text);
        setGlobalStats(data.global ?? null);
        setPorHabito(Array.isArray(data.porHabito) ? data.porHabito : []);
        setMensual(Array.isArray(data.mensual) ? data.mensual : []);
      } catch (err) {
        console.log("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!userId) return;
    loadStats();
  }, [userId]);

  useFocusEffect(
  useCallback(() => {
    loadStats();
  }, [userId])
  );
  
  const colors = {
    background: isDark ? "#0E0F12" : "#F5F7FA",
    text: isDark ? "#FFFFFF" : "#0A0A0A",
    subtext: isDark ? "#BFC3CA" : "#5A5F66",
    accent: isDark ? "#4A8CFF" : "#0076FF",
    surface: isDark ? "#17191E" : "#FFFFFF",
    border: isDark ? "#2A2D33" : "#E4E7EB",
  };

  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  const safeMensual = Array.isArray(mensual) ? mensual : [];

  const labels =
    safeMensual.length > 0
      ? safeMensual.map((m) =>
          monthNames[m.mes - 1] ?? `Mes ${m.mes ?? "?"}`
        )
      : ["Mes"];

  const dataValues =
    safeMensual.length > 0
      ? safeMensual.map((m) => Number(m.cumplidos) || 0)
      : [0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerContainer}>
        <Ionicons name="stats-chart" size={42} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Estadísticas
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
          Tu progreso diario, hábitos y rendimiento general
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        {/* CARD GLOBAL */}
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Resumen Global
          </Text>

          {loading && (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 16 }} />
          )}

          {!loading && globalStats && (
            <View style={{ width: "100%", marginTop: 12 }}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Hábitos activos</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {globalStats.totalHabitos}
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Cumplidos hoy</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {globalStats.habitosCumplidosHoy}
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Porcentaje general</Text>
                <Text style={[styles.value, { color: colors.accent }]}>
                  {globalStats.porcentajeGeneral}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* BARRAS POR HÁBITO */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Rendimiento por Hábito
          </Text>

          {porHabito.length === 0 && (
            <Text style={{ color: colors.subtext }}>No hay datos aún</Text>
          )}

          {porHabito.map((item, idx) => {
            const cumplidos = Number(item.total_cumplidos) || 0;
            const total = Number(item.total_registros) || 0;
            const noCumplidos = total - cumplidos;
            const pct = total > 0 ? Math.round((cumplidos / total) * 100) : 0;

            return (
              <View key={idx} style={{ marginBottom: 18 }}>
                {/* Nombre del hábito */}
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                  {item.habito}
                </Text>

                {/* Barra horizontal */}
                <View
                  style={{
                    flexDirection: "row",
                    height: 20,
                    width: "100%",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 6,
                  }}
                >
                  {/* Verde: cumplidos */}
                  <View
                    style={{
                      width: total === 0 ? "0%" : `${(cumplidos / total) * 100}%`,
                      backgroundColor: "#83b7f4ff",
                    }}
                  />

                  {/* Rojo: no cumplidos */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#4656beff",
                    }}
                  />
                </View>

                {/* Texto debajo */}
                <Text style={{ color: colors.subtext, marginTop: 4, fontSize: 13 }}>
                  {cumplidos} ✔ — {noCumplidos} ✘ ({pct}%)
                </Text>
              </View>
            );
          })}
        </View>


        {/* GRÁFICA MENSUAL */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Progreso Mensual
          </Text>

          <LineChart
            data={{
              labels,
              datasets: [{ data: dataValues }],
            }}
            width={screenWidth}
            height={240}
            withShadow
            yAxisLabel=""
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 118, 255, ${opacity})`,
              labelColor: () => colors.subtext,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: colors.accent,
              },
            }}
            bezier
            style={styles.chartStyle}
            fromZero
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    gap: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.65,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    width: "100%",
    opacity: 0.15,
    marginVertical: 4,
    backgroundColor: "#999",
  },
  chartCard: {
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
