import {Routes, Route} from "react-router-dom"
import About from "./pages/About"
import Login from "./pages/Login"
import CreateUser from "./pages/CreateUser"
import LandingPage from "./pages/LandingPage"
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/"element={<LandingPage></LandingPage>}> </Route>
      <Route path="/About"element={<About></About>}> </Route>
      <Route path="/Login"element={<Login></Login>}> </Route>
      <Route path="/CreateUser"element={<CreateUser></CreateUser>}> </Route>
    </Routes>
  );
}