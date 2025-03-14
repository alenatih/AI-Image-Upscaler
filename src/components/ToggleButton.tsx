import React, { useState, useEffect } from "react"
import "./ToggleButton.css"

function ToggleButton() {
  // Initialize state based on sessionStorage
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = sessionStorage.getItem("isLightMode")
    return savedMode ? JSON.parse(savedMode) : true // Makes the app light mode by default
  })

  useEffect(() => {
    const root = document.getElementById("root")
    const backgroundSvgHeader = document.querySelector(".background-svg-header")
    const backgroundSvgMain = document.querySelector(".background-svg-main")
    const headerContainer = document.querySelector(".header-container")
    const mainContainer = document.querySelector(".main-container")
    const authors = document.querySelector(".authors")
    const designerContainer = document.querySelector(".designer-container")
    const frontendDeveloperContainer = document.querySelector(".frontend-developer-container")
    const backgroundSvgDesigner = document.querySelector(".background-svg-designer")
    const backgroundSvgFrontend = document.querySelector(".background-svg-frontend")

    if (isLightMode) {
      root.classList.add("light-mode")
      root.classList.remove("dark-mode")

      headerContainer.classList.add("light-mode")
      headerContainer.classList.remove("dark-mode")

      mainContainer.classList.add("light-mode")
      mainContainer.classList.remove("dark-mode")

      backgroundSvgHeader.style.backgroundColor = "whitesmoke"
      backgroundSvgMain.style.backgroundColor = "whitesmoke"

      authors.style.backgroundColor = "#C1C7D7"

      designerContainer.style.backgroundColor = "whitesmoke"
      frontendDeveloperContainer.style.backgroundColor = "whitesmoke"
      backgroundSvgDesigner.style.backgroundColor = "whitesmoke"
      backgroundSvgFrontend.style.backgroundColor = "whitesmoke"
      designerContainer.style.boxShadow = "0 0 250px rgba(116, 128, 164, 0.8)"
      frontendDeveloperContainer.style.boxShadow = "0 0 250px rgba(116, 128, 164, 0.8)"
    } else {
      root.classList.add("dark-mode")
      root.classList.remove("light-mode")

      headerContainer.classList.add("dark-mode")
      headerContainer.classList.remove("light-mode")

      mainContainer.classList.add("dark-mode")
      mainContainer.classList.remove("light-mode")

      backgroundSvgHeader.style.backgroundColor = "#242424"
      backgroundSvgMain.style.backgroundColor = "#242424"

      authors.style.backgroundColor = "#575757"

      designerContainer.style.backgroundColor = "#2A303C"
      frontendDeveloperContainer.style.backgroundColor = "#2A303C"
      backgroundSvgDesigner.style.backgroundColor = "#2A303C"
      backgroundSvgFrontend.style.backgroundColor = "#2A303C"
      designerContainer.style.boxShadow = "0 0 40px #28292B"
      frontendDeveloperContainer.style.boxShadow = "0 0 40px #28292B"
    }
  }, [isLightMode])

  const toggleMode = () => {
    const newMode = !isLightMode
    setIsLightMode(newMode)
    // console.log("clicked", isLightMode)

    sessionStorage.setItem("isLightMode", JSON.stringify(newMode))
    // Save the state to sessionStorage when it changes
  }

  return (
    <div className="toggle-button-container">
      {isLightMode ? (
        <p className="toggle-text">Dark</p>
      ) : (
        <p className="toggle-text">Light</p>
      )}
      <label className="toggle">
        <input type="checkbox" checked={isLightMode} onChange={toggleMode} />
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
