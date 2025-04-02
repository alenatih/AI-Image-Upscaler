import React from "react"
import ReactDOM from "react-dom/client"
// import { Helmet } from "react-helmet"
import App from "./App"
import { ThemeProvider } from "./context/ThemeContext"
import "./index.css"

const rootElement = document.getElementById("root")
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  )
} else {
  console.error("Element with ID 'root' not found")
}

// const root = ReactDOM.createRoot(document.getElementById("root"))
// root.render(<App />)
