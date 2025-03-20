import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const TaskService = {

    addTask: async (task) => {
        try {
            const response = await axios.post(`${API_URL}/tasks`, task);
            return response.data;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    },
    
    updateTask: async (task) => {
        try {
            const response = await axios.patch(`${API_URL}/tasks/${task.id}`, task);
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Delete a single task
    deleteTask: async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Delete selected tasks
    deleteSelectedTasks: async (taskIds) => {
        try {
            const response = await axios.delete(`${API_URL}/tasks`, {
                data: { ids: taskIds }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting selected tasks:', error);
            throw error;
        }
    },

    // Update the status of a task
    updateTaskStatus: async (taskId, status) => {
        try {
            const response = await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },
};
