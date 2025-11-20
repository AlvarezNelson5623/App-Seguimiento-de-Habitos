import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weekDates: Date[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  weekDates,
  goToPreviousWeek,
  goToNextWeek,
}) => {
  return (
    <View style={styles.calendarContainer}>
      {/* Encabezado de semanas */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek}>
          <Text style={styles.arrow}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.weekText}>
          Semana del {weekDates[0].getDate()} al {weekDates[6].getDate()}
        </Text>

        <TouchableOpacity onPress={goToNextWeek}>
          <Text style={styles.arrow}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {weekDates.map((date, index) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayContainer, isSelected && styles.selectedDay]}
              onPress={() => onDateChange(date)}
            >
              <Text style={styles.dayName}>
                {date.toLocaleDateString("es-ES", { weekday: "short" })
                  .toUpperCase()
                  .replace(".", "")}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedDayNumber,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrow: {
    color: "white",
    fontSize: 22,
    paddingHorizontal: 10,
  },
  weekText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dayContainer: {
    width: 55,
    height: 70,
    marginRight: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
  },
  selectedDay: {
    backgroundColor: "#4CAF50",
  },
  dayName: {
    color: "#CCCCCC",
    fontSize: 12,
    marginBottom: 5,
  },
  dayNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedDayNumber: {
    color: "black",
  },
});
