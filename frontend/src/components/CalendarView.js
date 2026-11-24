import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function CalendarView({
  selectedDate,
  onSelectDate,
  scheduledDates = [], // Array of 'YYYY-MM-DD' strings
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build month matrix
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysMatrix = [];
  // Leading empty slots
  for (let i = 0; i < firstDayIndex; i++) {
    daysMatrix.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    daysMatrix.push(d);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.calendarCard}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.monthTitleWrap}>
          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>
        </View>

        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekRow}>
        {DAYS.map((day, idx) => (
          <View key={idx} style={styles.weekCell}>
            <Text style={[styles.weekText, idx === 0 && { color: COLORS.accentTerracotta }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Day Cells Grid */}
      <View style={styles.grid}>
        {daysMatrix.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const padMonth = String(month + 1).padStart(2, '0');
          const padDay = String(day).padStart(2, '0');
          const dateStr = `${year}-${padMonth}-${padDay}`;

          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const hasSchedule = scheduledDates.includes(dateStr);

          return (
            <TouchableOpacity
              key={`day-${day}`}
              activeOpacity={0.7}
              onPress={() => onSelectDate(dateStr)}
              style={styles.dayCell}
            >
              <View
                style={[
                  styles.dayInner,
                  isSelected && styles.daySelected,
                  isToday && !isSelected && styles.dayToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isToday && !isSelected && styles.dayTextToday,
                  ]}
                >
                  {day}
                </Text>

                {/* Schedule indicator dot */}
                {hasSchedule ? (
                  <View
                    style={[
                      styles.dot,
                      isSelected && styles.dotSelected,
                    ]}
                  />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  monthTitleWrap: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.pill,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 6,
    marginTop: 4,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInner: {
    width: 34,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelected: {
    backgroundColor: COLORS.primary,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: COLORS.accentGold,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: COLORS.accentGold,
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentGold,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 2,
  },
});
