import { useState } from "react"
import ImagePair from './ImagePair.js'
import Tab from './Tab.js'
import "./DemoContainer.css"
import DemoImageCatBefore from "../assets/demo-image-cat-before.png"
import DemoreImageCatUpscaled from "../assets/demo-image-cat-upscaled.png"
import CoffeeLaptopBefore from "../assets/coffee-laptop-before.png"
import CoffeeLaptopUpscaled from "../assets/coffee-laptop-upscaled.png"
import AllienBefore from "../assets/allien-before.png"
import AllienUpscaled from "../assets/allien-upscaled.png"
import ElfGirlBefore from "../assets/elf-girl-before.png"
import ElfGirlUpscaled from "../assets/elf-girl-upscaled.png"

function DemoContainer() {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex)
  }

  // Array of image paths for each tab
  const imagePaths = [
    [DemoImageCatBefore, DemoreImageCatUpscaled],
    [ElfGirlBefore, ElfGirlUpscaled],
    [CoffeeLaptopBefore, CoffeeLaptopUpscaled], 
    [AllienBefore, AllienUpscaled]
  ]

  return (
    <div className="demo-container">
      <h3 className="demo-title">Examples of upscaled images</h3>
      <div className="image-pairs">
        {imagePaths.map((paths, index) => (
          <ImagePair 
            key={index} 
            active={activeTab === index} 
            imagePaths={paths} 
          />
        ))}
      </div>
      <div className="tabs">
        {imagePaths.map((paths, index) => (
          <Tab
            key={index}
            index={index}
            active={activeTab === index}
            onClick={handleTabClick}
            imagePaths={paths}
          />
        ))}
    </div>
    </div>
  )
}

export default DemoContainer
