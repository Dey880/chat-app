import { Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";  // Assuming this is your profile page
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/createUser" element={<CreateUser />} />
      <Route path="/chat" element={<ChatPage />} />
      
      {/* Add a route for the Profile Page */}
      <Route path="/profile" element={<Profile />} />
      
      {/* Nested route example */}
      <Route path="/chat/:roomId" element={<ChatPage />} />
      {/* ":roomId" is a dynamic parameter for the chat room */}
    </Routes>
  );
}