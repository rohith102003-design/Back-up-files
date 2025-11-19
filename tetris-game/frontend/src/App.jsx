// src/App.jsx
import React from "react";
import TetrisBoard from "./components/TetrisBoard";

export default function App(){
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220" }}>
      <TetrisBoard />
    </div>
  );
}
