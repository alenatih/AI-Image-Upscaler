import React, { useCallback, useState, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Header from "./components/Header.jsx"
import Authors from "./components/Authors.jsx"
import Footer from "./components/Footer.jsx"
import ProgressBar from "./components/ProgressBar.jsx"
import DemoContainer from "./components/DemoContainer.jsx"
import './App.css'

import Upscaler from "upscaler"
import x2 from "@upscalerjs/esrgan-slim/2x"
import x3 from "@upscalerjs/esrgan-slim/3x"
import x4 from "@upscalerjs/esrgan-slim/4x"

// import deblurringModel from '@upscalerjs/maxim-deblurring'
// import denoisingModel from '@upscalerjs/maxim-denoising'

const upscaler = new Upscaler({
  modelx2: x2,
  modelx3: x3,
  modelx4: x4,
})

const localUpscaler = new Upscaler({
  modelx2: {
    scale: 2,
    path: "/esrgan-slim/models/x2/model.json",
  },
  modelx3: {
    scale: 3,
    path: "/esrgan-slim/models/x3/model.json",
  },
  modelx4: {
    scale: 4,
    path: "/esrgan-slim/models/x4/model.json",
  },
})

// const deblurrer = new Upscaler({
//   model: deblurringModel,
// })

// const denoiser = new Upscaler({
//   model: denoisingModel,
// })

// upscaler.dispose().then(() => {
//   console.log("All cleaned up!")
// })


// Loader for uploading an image, and progress bar — for upscaling it

function App() {
  const [src, setSrc] = useState()
  const [originalSize, setOriginalSize] = useState()
  const [scale, setScale] = useState(1)
  const [interpolation, setInterpolation] = useState("bicubic")
  const [upscaledImageSrc, setUpscaledImageSrc] = useState()
  const [displayUpscaledImageSrc, setDisplayUpscaledImageSrc] = useState(false)
  const [dragX, setDragX] = useState(.5)
  const [dragging, setDragging] = useState(false)
  const container = useRef()
  const [downloadFormat, setDownloadFormat] = useState("jpg") // Track selected download format
  const [scalingFactor, setScalingFactor] = useState(2) // Track selected scaling factor
  const [fileName, setFileName] = useState("")
  const [originalFormat, setOriginalFormat] = useState("jpg")
  const [isUpscaleClicked, setIsUpscaleClicked] = useState(false) // Track whether the upscale button has been clicked
  const [isLoaderVisible, setIsLoaderVisible] = useState(false)
  const [isProgressBarVisible, setIsProgressBarVisible] = useState(false)
  // const [progress, setProgress] = useState(0)
  const [selectedForDeletion, setSelectedForDeletion] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)


  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    // console.log(file.name.split(".")[0])
    const newFileName = file.name.split(".")[0]
  
    // console.log(file.name.split(".")[1])
    const newOriginalFormat = file.name.split(".")[1]
  
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      alert("Please upload only jpg or png files!")
      return
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB limit")
      return
    }
  
    if (selectedForDeletion) {
      return
    }
  
    setIsLoaderVisible(true)
  
    setFileName(newFileName)
  
    setOriginalFormat(newOriginalFormat)
  
    const fr = new FileReader()
    let isCurrent = true // Flag to track the validity of the callback
  
    fr.onload = () => {
      if (!isCurrent) return // Check if this callback is still valid
      setSrc(fr.result)
    }
  
    fr.readAsDataURL(file)
  
    return () => {
      isCurrent = false // Cleanup function to mark this callback as no longer current
    }
  }, [selectedForDeletion])


  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })


  useEffect(() => {
    let warmupPromise
    if (src && !isUpscaleClicked) {
      warmupPromise = upscaler.warmup({ patchSize: 64, padding: 2 })
      warmupPromise.then(() => {
        console.log("All warmed up!")
    })
    }

    return () => {
      if (warmupPromise) {
        warmupPromise.cancel && warmupPromise.cancel()
      }
    }
  }, [src, isUpscaleClicked])



  useEffect(() => {
    let warmupPromise
    if (src && !isUpscaleClicked) {
      warmupPromise = localUpscaler.warmup({ patchSize: 64, padding: 2 })
      warmupPromise.then(() => {
        console.log("All warmed up!")
    })
    }

    return () => {
      if (warmupPromise) {
        warmupPromise.cancel && warmupPromise.cancel()
      }
    }
  }, [src, isUpscaleClicked])


useEffect(() => {
  let isCurrent = true // This flag will help in checking if the effect is the current one

  if (src) {
    if (selectedForDeletion) {
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src

    img.onload = async () => {
      if (!isCurrent) return // Check if this effect is still the current one

      if (img.height > 1000 || img.width > 1000) {
        alert("Image dimensions should not exceed 1000px")
        if (!isCurrent) return
        setIsLoaderVisible(false)
        setIsProgressBarVisible(false)
        if (!isCurrent) return
        window.location.reload()
        return
      }

      // setIsProgressBarVisible(true) // Show progress bar when upscaling starts

      try {
        const upscaledSrc = await upscaler.upscale(img, {
          patchSize: 64,
          padding: 2,
        })
        if (!isCurrent) return // Check if this effect is still the current one
        setUpscaledImageSrc(upscaledSrc)
        setIsLoaderVisible(false)
        setIsProgressBarVisible(true) // Show progress bar when upscaling starts
        // setIsProgressBarVisible(false)
        const width = img.width
        const height = img.height
        setOriginalSize({ width, height })
      } catch (error) {
        if (!isCurrent) return // Check if this effect is still the current one
        console.error('Error upscaling image:', error)
        alert('Error upscaling image:')

        try {
          const upscaledSrc = await localUpscaler.upscale(img, {
            patchSize: 64,
            padding: 2,
          })
          if (!isCurrent) return // Check if this effect is still the current one
          console.log("Local model was used")
          setUpscaledImageSrc(upscaledSrc)
          setIsLoaderVisible(false)
          setIsProgressBarVisible(true) // Show progress bar when upscaling starts
          // setIsProgressBarVisible(false) //
          const width = img.width
          const height = img.height
          setOriginalSize({ width, height })
        } catch (localError) {
          if (!isCurrent) return // Check if this effect is still the current one
          console.error('Error upscaling image with local model:', localError)
          alert('Error upscaling image with local model:')
        }

      } finally {
        if (isCurrent) {
          setIsProgressBarVisible(false)
        }
      }
    }

    return () => {
      isCurrent = false // Cleanup function to indicate this effect is no longer current
    }
  }
}, [src, selectedForDeletion])


  useEffect(() => {
    let isCurrent = true // Flag to check if the effect is still valid
  
    if (originalSize && isUpscaleClicked) {
      let upscaledImageSrcTimer
  
      const timer = setTimeout(() => {
        if (!isCurrent) return // Check if this effect is still the current one
        setScale(scalingFactor)
  
        upscaledImageSrcTimer = setTimeout(() => {
          if (!isCurrent) return // Check if this effect is still the current one
          setDisplayUpscaledImageSrc(true)
          setIsLoaderVisible(false)
          setIsProgressBarVisible(false)
        }, 1200)
      }, 300)
  
      return () => {
        isCurrent = false // Cleanup function to mark this effect as no longer current
        clearTimeout(timer)
        clearTimeout(upscaledImageSrcTimer)
      }
    }
  
    return () => {
      isCurrent = false // Cleanup function to mark this effect as no longer current
    }
  }, [originalSize, isUpscaleClicked, scalingFactor])


  const handleUpscale = () => {
    setIsUpscaleClicked(true)
    setIsProgressBarVisible(true)
  }


  const startDragging = () => {
    setDragging(true)
  }


  const drag = (e) => {
    if (dragging) {
    const offsetWidth = container.current.offsetWidth
    // const x = e.clientX - (window.innerWidth - offsetWidth) / 2 - 10
    const x = e.clientX - container.current.getBoundingClientRect().left
    setDragX(x / offsetWidth)
    }
  }


  const stopDragging = () => {
    // console.log('stop')
    setDragging(false)
  }


  // Touch event handlers
const touchStartDragging = () => {
  setDragging(true)
}

const touchDrag = (e) => {
  if (dragging) {
    const offsetWidth = container.current.offsetWidth
    const touch = e.touches[0]
    const x = touch.clientX - container.current.getBoundingClientRect().left
    setDragX(x / offsetWidth)
  }
}

const touchStopDragging = () => {
  setDragging(false)
}


  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }


  let imageFormat = ""

  const updateDownloadFormat = (e) => {
  //   setDownloadFormat(e.target.dataset.format)

  const format = e.target.dataset.format

  imageFormat = format

  // console.log(imageFormat)

  setDownloadFormat(imageFormat)

  downloadCallback()
}


const downloadCallback = () => {
  // console.log(downloadFormat)
  downloadImage()
}


  const downloadImage = () => {
    const link = document.createElement("a")
    const image = new Image()
    image.src = upscaledImageSrc
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.height = image.height
      canvas.width = image.width
      const ctx = canvas.getContext("2d")
      ctx.drawImage(image, 0, 0)
      link.href = canvas.toDataURL(`image/${imageFormat}`) // Convert image to selected format
      link.download = `${fileName}-upscaled.${imageFormat}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }


  const downloadImageOriginalFormat = () => {
    const link = document.createElement("a")
    const image = new Image()
    image.src = upscaledImageSrc
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.height = image.height
      canvas.width = image.width
      const ctx = canvas.getContext("2d")
      ctx.drawImage(image, 0, 0)
      
      link.href = canvas.toDataURL(`image/${originalFormat}`)
      link.download = `${fileName}-upscaled.${originalFormat}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }


  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value)
    setScalingFactor(value)

    const sliderInput = document.querySelector(".slider-input")
  
    if (value === 2 || value === 3) {
      sliderInput.style.background = value === 2 ? "#E0E3EB" : "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)"
    } else if (value === 3 || value === 4) {
      sliderInput.style.background = value === 3 ? "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)" : "#FF668A"
    }
  
    // console.log(value)
  }


  const handleLabelClick = (value) => {
    setScalingFactor(value)
    updateSliderColor(value)
  }


  const updateSliderColor = (value) => {
    const sliderInput = document.querySelector(".slider-input")
    if (value === 2 || value === 3) {
      sliderInput.style.background = value === 2 ? "#E0E3EB" : "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)"
    } else if (value === 3 || value === 4) {
      sliderInput.style.background = value === 3 ? "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)" : "#FF668A"
    }
  }
  

  const handleDelete = () => {
    setSelectedForDeletion(true)
    setSrc(null)
    window.location.reload()
    setIsUpscaleClicked(false)
  } 

  
  const left = dragX * 100
  

  return (
    

        <div className="app container">

          <header className="header">

            <svg className="background-svg-header" width="100%" height="100%">
              <pattern id="pattern-circles" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="#D1D5E1"></circle>
              </pattern>
              <rect  id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
            </svg>

            {/* https://codepen.io/oc/pen/JwpbmY */}


            <div className="header-container light-mode">
              <Header />
            </div>
          </header>

          <main className="main" id="main">

            <svg className="background-svg-main" width="100%" height="100%">
              <pattern id="pattern-circles" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="#D1D5E1"></circle>
              </pattern>
              <rect  id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
            </svg>

            <div className="main-container light-mode">

            <div className="main-left-and-right-container">

              <div className="main-left">

                <h2 className="title">AI tool</h2>
                <h1 className="title-description">Increase the resolution of your image</h1>
                <p>AI and JavaScript work together to help you enlarge your images without losing quality. 
                You can use it on your phone or computer. A great tool to have on hand!</p>

              </div>

            <div className="main-right">

            {!src && (
              <div className="dropzone-container">
                <div className="dropzone" {...getRootProps()}>

                  <div className="dropzone-image">
                    <i className="fa-regular fa-file"></i>
                  </div>

                  <div className="dropzone-input">
                    <input type="file" accept="image/*" onChange={(e) => onDrop(e.target.files)} {...getInputProps()} />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      // <p>Drag 'n' drop some files here, or click to select files</p>
                      <p className="dropzone-text"><span className="bold">Click or drop</span> image here</p>
                    )}
                    <p className="image-requirement">JPG / PNG format, up to 5 MB</p>
                  </div>
                  
                </div>
              </div>
            )}
              

                {src && (
                  <div className="upscale-container">
          
          
                <div
                  className="original-image"
          
                  style={{
                    width: originalSize ? originalSize.width * scale : null,
                  }}
                >
          
                  <div className="upscale-header">
                    {displayUpscaledImageSrc && (
                    <>
                    <div className="interpolation">
                      <button
                        className={`button-no-interpolation ${interpolation === "none" ? "active" : null}`}
                        onClick={() => setInterpolation("none")}
                      >
                        None
                      </button>
                      <button
                        className={`button-bicubic ${interpolation === "bicubic" ? "active" : null}`}
                        onClick={() => setInterpolation("bicubic")}
                      >
                        Bicubic interpolation
                      </button>
                    </div>
                    <div>
                      <h4 className="display-title">Upscaled image</h4>
                    </div>
                    </>
                    )}
                  </div>
                  <div
                    className="display"
                    style={{
                      width: originalSize ? originalSize.width * scale : null,
                      height: originalSize ? originalSize.height * scale : null,
                    }}
                  >
                    {displayUpscaledImageSrc && (
                      <div
                        className="dragOverlay"
                        ref={container}
                        onMouseMove={drag}
                        onMouseUp={stopDragging}
                        onTouchMove={touchDrag}
                        onTouchEnd={touchStopDragging}
                      >
                        <div
                          className="dragger"
                          onMouseDown={startDragging}
                          onTouchStart={touchStartDragging}
                          style={{
                            left: `calc(${left}%)`,
                          }}
                        >
                          <div className="dragger-circle"></div>
                        </div>
                      </div>
                    )}
                    <div className="image-container original">
                      <img
                        src={src}
                        alt="Original"
                        width={originalSize ? originalSize.width * scale : null}
                        style={{
                          imageRendering: interpolation === 'none' ? 'pixelated' : null,
                        }}
                      />
                    </div>
          
                    {displayUpscaledImageSrc && isUpscaleClicked && !selectedForDeletion  && (
                      <div
                        className="image-container scaled-up"
                        style={{
                          width: `${100 - left}%`,
                          left: `${left}%`,
                        }}
                      >
                        <img
                          style={{
                            left: ((originalSize.width * scale * left) / 100) * -1,
                          }}
                          alt="Upscaled"
                          src={upscaledImageSrc}
                          width={originalSize ? originalSize.width * scale : null}
                        />
                      </div>
                    )}
                  </div>

                  {isLoaderVisible && (<div className="loader"></div>)}

                  {/* {isProgressBarVisible && <ProgressBar progress={progress} />} */}
                  {isProgressBarVisible && <ProgressBar />}
          
                </div>
                </div>
                )
                }

            </div>

          </div>

          <section className="buttons-section">

                <div className="scaling-slider">
                  <h4 className="level-label">Level</h4>
                  <div className="input-label-container">
                    <input 
                      className="slider-input"
                      type="range" 
                      min="2" 
                      max="4" 
                      step="1" 
                      value={scalingFactor} 
                      onChange={handleSliderChange}
                    />
                    <div className="scale-labels-container">
                      <label 
                        className={`circle ${scalingFactor === 2 ? "active" : ""}`}
                        onClick={() => handleLabelClick(2)}
                      >
                        x2
                      </label>
                      <label 
                        className={`circle ${scalingFactor === 3 ? "active" : ""}`}
                        onClick={() => handleLabelClick(3)}
                      >
                        x3
                      </label>
                      <label 
                        className={`circle ${scalingFactor === 4 ? "active" : ""}`}
                        onClick={() => handleLabelClick(4)}
                      >
                        x4
                      </label>
                    </div>
                  </div>
                </div>

              <div className="buttons-container-right">

              <div className="delete-upscale-buttons-container">

                  {!src && !isUpscaleClicked && (
                    <button className="delete-button-disabled">
                      {/* <FontAwesomeIcon icon="fa-regular fa-trash-can" /> */}
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  )}

                      {!src && !isUpscaleClicked && (
                          <div>
                            <button className="upscale-button-disabled">Upscale image</button>
                          </div>
                        )}

              </div>

                <div className="delete-upscale-buttons-container">

                  {src && !isUpscaleClicked && (
                    <button className="delete-button" onClick={handleDelete}>
                      {/* <FontAwesomeIcon icon="fa-regular fa-trash-can" /> */}
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  )}

                      {src && !isUpscaleClicked && ( // Render upscale button only if an image is uploaded
                        // and upscale button is not clicked
                          <div>
                            <button className="upscale-button" onClick={handleUpscale}>Upscale image</button>
                          </div>
                        )}

                </div>

                {displayUpscaledImageSrc && (
                        <>

                          <p className="upscaled-text">{scalingFactor}x upscaled using the esrgan-slim model</p>

                          

                          <div className="delete-download-buttons-container">

                              <button className="delete-button" onClick={handleDelete}>
                                <i className="fa-regular fa-trash-can"></i>
                              </button>

                              <div className="download-buttons-container">

                                <div className="download-arrow-container">

                                  <button className="download-button" onClick={downloadImageOriginalFormat}>
                                    Download
                                  </button>

                                  <button className="arrow-button" onClick={toggleDropdown}>
                                    <i className="fa-solid fa-caret-down"></i>
                                  </button>

                                </div>


                                  {isDropdownOpen && (
                                    <div className="download-formats-container">

                                      <button className="download-button-jpg" data-format="jpg" onClick={updateDownloadFormat}>
                                      Download .jpg
                                    </button>

                                    <button className="download-button-png" data-format="png" onClick={updateDownloadFormat}>
                                      Download .png
                                    </button>

                                  </div>
                                  )}

                               </div> 

                          </div>

                      </>
                    )}

                </div>


          </section>

          </div>

          </main>

          <section className="how-it-works" id="how-it-works">
            <div className="how-it-works-left">
              <h2 className="how-it-works-title">How it works</h2>
              {/* <p>Image Upscaler is an online service that zooms images and photos from 2 to 6 times. 
                It uses artificial intelligence that enlarges images without loss of quality, 
                making them clearer.</p> */}
              <ol className="how-it-works-list">
                <li>Upload an image.</li>
                <li>Choose the scale you need — 2x, 3x, or 4x.</li>
                <li>Click the "Upscale image" button.</li>
                <li>Get your upscaled image! You can drag the slider left and right to see it before and after, 
                  and download the upscaled image in "jpg" or "png" format.</li>
              </ol>
            </div>

            <div className="how-it-works-right">
              {/* <p>Upscaled images are here</p> */}
              {/* <img className="demo-image-cat" src={DemoImageCat}></img> */}
              <DemoContainer />

            </div>

          </section>

          <section className="authors" id="authors">
            <Authors />
          </section>

          <footer className="footer">
            <Footer />
          </footer>

        </div>

    
  )

}

export default App
