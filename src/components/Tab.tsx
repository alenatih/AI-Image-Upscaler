import React from "react"

function Tab({ index, active, onClick, imagePaths }) {
  return (
    <div
      className={`tab ${active ? 'active' : ''}`}
      onClick={() => onClick(index)}
    >
      <img src={imagePaths[0]} alt="Image 1" />
    </div>
  )
}

export default Tab
