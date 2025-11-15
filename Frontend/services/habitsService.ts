import API from "./api";

// =============================
// GET hábtos del usuario
// =============================
export const getUserHabits = async (userId: number) => {
  try {
    const response = await API.get(`/habits/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al obtener los hábitos del usuario"
    );
  }
};

// =============================
// GET hábitos globales
// =============================
export const getGlobalHabits = async () => {
  try {
    const response = await API.get(`/habits/global`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al obtener los hábitos globales"
    );
  }
};

// =============================
// POST crear hábito personalizado
// =============================
export const addCustomHabit = async (habitData: any) => {
  try {
    const response = await API.post(`/habits/custom`, habitData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al crear el hábito personalizado"
    );
  }
};

// =============================
// POST asignar hábito existente al usuario
// =============================
export const addExistingHabit = async (
  userId: number,
  habitId: number
) => {
  try {
    const response = await API.post(`/habits/assign`, {
      userId,
      habitId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al asignar el hábito"
    );
  }
};

// =============================
// DELETE eliminar hábito del usuario
// =============================
export const removeUserHabit = async (
  userId: number,
  habitId: number
) => {
  try {
    const response = await API.delete(`/habits/remove`, {
      data: { userId, habitId },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al eliminar el hábito"
    );
  }
};
