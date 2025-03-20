import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const ProjectService = {
  getProjects: async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  addProject: async (project) => {
    try {
      const response = await axios.post(`${API_URL}/projects`, project);
      return response.data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  updateProject: async (project) => {
    try {
      const response = await axios.patch(`${API_URL}/projects/${project.id}`, project);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  deleteSelectedProjects: async (projectIds) => {
    try {
      const response = await axios.delete(`${API_URL}/projects`, {
        data: { ids: projectIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting selected projects:', error);
      throw error;
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },
};