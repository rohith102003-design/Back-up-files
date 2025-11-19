import {Routes,Route} from "react-router-dom"
import Login from "./pages/login";
import { Link } from "react-router-dom";

function Home(){
  return (
    <Link to="/login">
      <button style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Login
      </button>
    </Link>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
