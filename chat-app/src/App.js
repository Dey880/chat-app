import { Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import CreateRoom from "./pages/CreateRoom";
import EditRoom from "./pages/EditRoom";
import NotFound from "./pages/404";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/createUser" element={<CreateUser />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat/:roomId" element={<ChatPage />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/edit-room/:roomId" element={<EditRoom />} />
    </Routes>
  );
}