import React, { useState, useEffect, useRef } from "react"
import ToggleButton from "./ToggleButton.jsx"
import Logo from "../assets/logo.png"

function Header() {
    
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth < 600 ? true : false
  })

  const menuRef = useRef(null)

  const checkScreenSize = () => {
    setIsMobile(() => {
      return window.innerWidth < 600 ? true : false
    })
  }

  useEffect(() => {
    // Set up an event listener
    window.addEventListener("resize", checkScreenSize)

    // Check screen size on initial load
    checkScreenSize()

    // Clean up an event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (
            menuRef.current &&
            event.target instanceof Node &&
            !menuRef.current.contains(event.target)
        ) {
            setIsDropdownOpen(false)
        }
    }

    // Add event listener when the menu is open
    if (isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("touchstart", handleClickOutside)
    }

    // Clean up event listeners on unmount of the component or when the menu closes
    // to prevent memory leaks or unwanted behavior
    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchstart", handleClickOutside)
    }
}, [isDropdownOpen, menuRef])

  return (
    <>
      <div className="logo-container">
        <img className="logo-image" src={Logo} alt="Logo" />
        <h2 className="logo-text">Image Upscaler</h2>
      </div>

      <div className="navbar">
        {isMobile ? (
          <div
            className="header-mobile-menu">
            <i
              className="fa-solid fa-bars burger-icon"
              onClick={toggleDropdown}>
            </i>
            {isDropdownOpen && (
              <div
                className={`mobile-menu-opened ${isDropdownOpen ? "slide-in" : ""}`}
                ref={menuRef}>
                <a href="#main">Upscaler</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#authors">Authors</a>
              </div>
            )}
          </div>
        ) : (
          <div className="header-navbar-links">
            <a href="#main">Upscaler</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#authors">Authors</a>
          </div>
        )}

        <ToggleButton />
      </div>
    </>
  )
}

export default Header


