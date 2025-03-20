import logo from './logo.svg';
import './App.css';
import ProjectList from './pages/ProjectList';
import TaskList from './pages/TaskList';
import { BrowserRouter, Routes, Route } from "react-router";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<ProjectList />} />
          <Route path=":id" element={<TaskList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}