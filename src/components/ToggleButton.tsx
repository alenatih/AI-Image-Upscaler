import { useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import "./ToggleButton.css"

function ToggleButton() {
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement
    const backgroundSvgHeader = document.querySelector(".background-svg-header") as HTMLElement
    const backgroundSvgMain = document.querySelector(".background-svg-main") as HTMLElement
    const headerContainer = document.querySelector(".header-container") as HTMLElement
    const mainContainer = document.querySelector(".main-container") as HTMLElement
    const authors = document.querySelector(".authors") as HTMLElement
    const designerContainer = document.querySelector(".designer-container") as HTMLElement
    const frontendDeveloperContainer = document.querySelector(".frontend-developer-container") as HTMLElement
    const backgroundSvgDesigner = document.querySelector(".background-svg-designer")  as HTMLElement
    const backgroundSvgFrontend = document.querySelector(".background-svg-frontend") as HTMLElement

    if (theme === "light") {
      root?.classList.add("light-mode")
      root?.classList.remove("dark-mode")

      headerContainer?.classList.add("light-mode")
      headerContainer?.classList.remove("dark-mode")

      mainContainer?.classList.add("light-mode")
      mainContainer?.classList.remove("dark-mode")

      if (backgroundSvgHeader) backgroundSvgHeader.style.backgroundColor = "whitesmoke"
      if (backgroundSvgMain) backgroundSvgMain.style.backgroundColor = "whitesmoke"

      if (authors) authors.style.backgroundColor = "#C1C7D7"

      if (designerContainer) {
        designerContainer.style.backgroundColor = "whitesmoke"
        designerContainer.style.boxShadow = "0 0 250px rgba(116, 128, 164, 0.8)"
      }
      
      if (frontendDeveloperContainer) {
        frontendDeveloperContainer.style.backgroundColor = "whitesmoke"
        frontendDeveloperContainer.style.boxShadow = "0 0 250px rgba(116, 128, 164, 0.8)"
      }
      
      if (backgroundSvgDesigner) backgroundSvgDesigner.style.backgroundColor = "whitesmoke"
      if (backgroundSvgFrontend) backgroundSvgFrontend.style.backgroundColor = "whitesmoke"
    } else if (theme === "dark") {
      root?.classList.add("dark-mode")
      root?.classList.remove("light-mode")

      headerContainer?.classList.add("dark-mode")
      headerContainer?.classList.remove("light-mode")

      mainContainer?.classList.add("dark-mode")
      mainContainer?.classList.remove("light-mode")

      if (backgroundSvgHeader) backgroundSvgHeader.style.backgroundColor = "#242424"
      if (backgroundSvgMain) backgroundSvgMain.style.backgroundColor = "#242424"

      if (authors) authors.style.backgroundColor = "#575757"

      if (designerContainer) {
        designerContainer.style.backgroundColor = "#2A303C"
        designerContainer.style.boxShadow = "0 0 40px #28292B"
      }
      
      if (frontendDeveloperContainer) {
        frontendDeveloperContainer.style.backgroundColor = "#2A303C"
        frontendDeveloperContainer.style.boxShadow = "0 0 40px #28292B"
      }
      
      if (backgroundSvgDesigner) backgroundSvgDesigner.style.backgroundColor = "#2A303C"
      if (backgroundSvgFrontend) backgroundSvgFrontend.style.backgroundColor = "#2A303C"
    }
  }, [theme])

  return (
    <div className="toggle-button-container">
      <p className="toggle-text">{theme === "light" ? "Light" : "Dark"}</p>
      <label className="toggle">
        <input type="checkbox" checked={theme === "light"} onChange={toggleTheme} />
        <span className="slider">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
          </svg>
        </span>
      </label>
    </div>
  )
}

export default ToggleButton

{/* <path fill="none" d="m4 16.5 8 8 16-16"></path> */}

// https://cssnippets.shefali.dev/toggle
