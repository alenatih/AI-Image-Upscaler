import React, { useCallback, useState, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Header from "./components/Header"
import Authors from "./components/Authors"
import Footer from "./components/Footer"
import ProgressBar from "./components/ProgressBar"
import DemoContainer from "./components/DemoContainer"
import "./App.css"

import Upscaler from "upscaler"
import x2 from "@upscalerjs/esrgan-slim/2x"
import x3 from "@upscalerjs/esrgan-slim/3x"
import x4 from "@upscalerjs/esrgan-slim/4x"

interface OriginalSize {
  width: number;
  height: number;
}

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

const upscalerConfig = {
  patchSize: 128,
  padding: 4,     // Reduces artifacts at patch boundaries
  progress: true,
  skipProcessing: false
}

function App(): JSX.Element {
  const [src, setSrc] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<OriginalSize | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [interpolation, setInterpolation] = useState<string>("bicubic")
  const [upscaledImageSrc, setUpscaledImageSrc] = useState<string | null>(null)
  const [displayUpscaledImageSrc, setDisplayUpscaledImageSrc] = useState<boolean>(false)
  const [dragX, setDragX] = useState<number>(0.5)
  const [dragging, setDragging] = useState<boolean>(false)
  const container = useRef<HTMLDivElement>(null)
  // const [downloadFormat, setDownloadFormat] = useState<string | null>("")
  const [scalingFactor, setScalingFactor] = useState<number>(2)
  const [fileName, setFileName] = useState<string>("")
  const [originalFormat, setOriginalFormat] = useState<string>("jpg")
  const [isUpscaleClicked, setIsUpscaleClicked] = useState<boolean>(false)
  const [isLoaderVisible, setIsLoaderVisible] = useState<boolean>(false)
  const [isProgressBarVisible, setIsProgressBarVisible] = useState<boolean>(false)
  const [selectedForDeletion, setSelectedForDeletion] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const newFileName = file.name.split(".")[0]
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
    let isCurrent = true
  
    fr.onload = () => {
      if (!isCurrent) return
      setSrc(fr.result as string)
    }
  
    fr.readAsDataURL(file)
  
    return () => {
      isCurrent = false
    }
  }, [selectedForDeletion])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  interface CancellablePromise<T> extends Promise<T> {
    cancel?: () => void
  }

  useEffect(() => {
    let warmupPromise: CancellablePromise<void>
    if (src && !isUpscaleClicked) {
      warmupPromise = upscaler.warmup({ patchSize: 128, padding: 4 })
      warmupPromise.then(() => {
        console.log("All warmed up!")
      })
    }

    return () => {
      if (warmupPromise && warmupPromise.cancel) {
        warmupPromise.cancel()
      }
    }
  }, [src, isUpscaleClicked])

  useEffect(() => {
    let warmupPromise: CancellablePromise<void>
    if (src && !isUpscaleClicked) {
      warmupPromise = localUpscaler.warmup({ patchSize: 128, padding: 4 })
      warmupPromise.then(() => {
        console.log("All warmed up!")
      })
    }

    return () => {
      if (warmupPromise && warmupPromise.cancel) {
        warmupPromise.cancel()
      }
    }
  }, [src, isUpscaleClicked])

  // Preprocess the image
  const preprocessImage = (image: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      // Sharpening before upscaling
      ctx.filter = "contrast(1.1) saturate(1.05)"
      ctx.drawImage(image, 0, 0, image.width, image.height)
      ctx.filter = "none"
    }
    
    return canvas
  }

  // Upscaling
  useEffect(() => {
    let isCurrent = true

    if (src) {
      if (selectedForDeletion) {
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = src

      img.onload = async () => {
        if (!isCurrent) return;

        if (img.height > 1000 || img.width > 1000) {
          alert("Image dimensions should not exceed 1000px")
          if (!isCurrent) return
          setIsLoaderVisible(false)
          setIsProgressBarVisible(false)
          if (!isCurrent) return
          window.location.reload()
          return
        }

        const width = img.width
        const height = img.height
        setOriginalSize({ width, height })
        
        try {
          const preprocessedCanvas = preprocessImage(img)

          setIsLoaderVisible(true)
          setIsProgressBarVisible(true)
          
          const modelToUse = scalingFactor === 2 ? "x2" : 
                            scalingFactor === 3 ? "x3" : "x4"
          
          const upscaledSrc = await upscaler.upscale(preprocessedCanvas, {
            ...upscalerConfig,
            model: modelToUse,
            output: {
              quality: 1.0,
              format: "image/png"
            }
          })
          
          if (!isCurrent) return

          const enhancedImageSrc = await enhanceUpscaledImage(upscaledSrc)
          setUpscaledImageSrc(enhancedImageSrc)
          setIsLoaderVisible(false)
        } catch (error) {
          if (!isCurrent) return
          console.error("Error upscaling image:", error)
          
          try {
            // Fallback to local model
            const upscaledSrc = await localUpscaler.upscale(img, upscalerConfig)
            if (!isCurrent) return
            console.log("Local model was used")
            
            const enhancedImageSrc = await enhanceUpscaledImage(upscaledSrc)
            setUpscaledImageSrc(enhancedImageSrc)
            setIsLoaderVisible(false)
          } catch (localError) {
            if (!isCurrent) return
            console.error("Error upscaling image with local model:", localError)
            alert("Error upscaling image with local model")
          }
        } finally {
          if (isCurrent) {
            setIsProgressBarVisible(false)
          }
        }
      }
    }

    return () => {
      isCurrent = false
    }
  }, [src, selectedForDeletion, scalingFactor])

  // Post-processing
  const enhanceUpscaledImage = async (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageSrc
      
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.height = img.height
        canvas.width = img.width
        const ctx = canvas.getContext("2d")
        
        if (ctx) {
          // Slight sharpening and color enhancement
          ctx.filter = "contrast(1.05) saturate(1.02) brightness(1.01)"
          ctx.drawImage(img, 0, 0)
          ctx.filter = "none"
          
          const sharpened = ctx.getImageData(0, 0, canvas.height, canvas.width)
          const enhancedDataUrl = canvas.toDataURL("image/png", 1.0)
          resolve(enhancedDataUrl)
        } else {
          resolve(imageSrc)
        }
      }
    })
  }

  const improvedScaledImageStyles = {
    // imageRendering: "auto", // Let browser use best algorithm
    willChange: "transform", // Optimize for animation
    // backfaceVisibility: "hidden" // Improve performance
  }

  // Dynamic choice of model based on scaling factor
  useEffect(() => {
    if (upscaler && scalingFactor) {
      const modelChoice = scalingFactor === 2 ? "modelx2" : 
                          scalingFactor === 3 ? "modelx3" : "modelx4"
      // console.log(`Using ${modelChoice} for ${scalingFactor}x upscaling`)
    }
  }, [scalingFactor])

  useEffect(() => {
    let isCurrent = true
  
    if (originalSize && isUpscaleClicked) {
      let upscaledImageSrcTimer: NodeJS.Timeout
  
      const timer = setTimeout(() => {
        if (!isCurrent) return
        setScale(scalingFactor)
  
        upscaledImageSrcTimer = setTimeout(() => {
          if (!isCurrent) return
          setDisplayUpscaledImageSrc(true)
          setIsLoaderVisible(false)
          setIsProgressBarVisible(false)
        }, 1200)
      }, 300)
  
      return () => {
        isCurrent = false
        clearTimeout(timer)
        clearTimeout(upscaledImageSrcTimer)
      }
    }
  
    return () => {
      isCurrent = false
    }
  }, [originalSize, isUpscaleClicked, scalingFactor])

  const handleUpscale = (): void => {
    setIsUpscaleClicked(true)
    setIsProgressBarVisible(true)
  }

  const startDragging = (): void => {
    setDragging(true)
  }

  const drag = (event: React.MouseEvent): void => {
    if (dragging && container.current) {
      const offsetWidth = container.current.offsetWidth
      const x = event.clientX - container.current.getBoundingClientRect().left
      setDragX(x / offsetWidth)
    }
  }

  const stopDragging = (): void => {
    setDragging(false)
  }

  const touchStartDragging = (): void => {
    setDragging(true)
  }

  const touchDrag = (event: React.TouchEvent): void => {
    if (dragging && container.current) {
      const offsetWidth = container.current.offsetWidth
      const touch = event.touches[0]
      const x = touch.clientX - container.current.getBoundingClientRect().left
      setDragX(x / offsetWidth)
    }
  }

  const touchStopDragging = (): void => {
    setDragging(false)
  }

  const toggleDropdown = (): void => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const updateDownloadFormat = (
    event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ): void => {
    const target = event.target as HTMLButtonElement
    const format = target.dataset.format || ""
    
    if (!format) return
    
    downloadImage(format)
  }

  const downloadImage = (format?: string): void => {
    if (!upscaledImageSrc  || !originalSize) return
    
    const imageFormat = format || originalFormat
    const scaledHeight = originalSize.height * scalingFactor
    const scaledWidth = originalSize.width * scalingFactor
    
    const link = document.createElement("a")
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = upscaledImageSrc
    
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.height = scaledHeight
      canvas.width = scaledWidth
      const ctx = canvas.getContext("2d")
      
      if (ctx) {
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight)

        const quality = imageFormat === "jpg" ? 0.95 : 1.0
        link.href = canvas.toDataURL(`image/${imageFormat}`, quality)
        link.download = `${fileName}-upscaled-${scalingFactor}x.${imageFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  const downloadImageOriginalFormat = (): void => {
    downloadImage()
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value)
    setScalingFactor(value)

    const sliderInput = document.querySelector(".slider-input") as HTMLElement
  
    if (value === 2 || value === 3) {
      sliderInput.style.background = value === 2 ? "#E0E3EB" : "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)"
    } else if (value === 3 || value === 4) {
      sliderInput.style.background = value === 3 ? "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)" : "#FF668A"
    }
  }

  const handleLabelClick = (value: number): void => {
    setScalingFactor(value)
    updateSliderColor(value)
  }

  const updateSliderColor = (value: number): void => {
    const sliderInput = document.querySelector(".slider-input") as HTMLElement
    if (value === 2 || value === 3) {
      sliderInput.style.background = value === 2 ? "#E0E3EB" : "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)"
    } else if (value === 3 || value === 4) {
      sliderInput.style.background = value === 3 ? "linear-gradient(to right, #FF668A 50%, #E0E3EB 50%)" : "#FF668A"
    }
  }

  const handleDelete = (): void => {
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
            <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="#AEAFB8"></circle>
          </pattern>
          <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>

        <div className="header-container">
          <Header />
        </div>
      </header>

      <main className="main" id="main">
        <svg className="background-svg-main" width="100%" height="100%">
          <pattern id="pattern-main-circles" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
            <circle id="pattern-main-circle" cx="10" cy="10" r="1.6257413380501518" fill="#AEAFB8"></circle>
          </pattern>
          <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-main-circles)"></rect>
        </svg>

        <div className="main-container">
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
                      <input type="file" accept="image/*" {...getInputProps()} />
                      {isDragActive ? (
                        <p>Drop the files here ...</p>
                      ) : (
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
                      width: originalSize ? originalSize.width * scale : undefined,
                    }}
                  >
                    <div className="upscale-header">
                      {displayUpscaledImageSrc && (
                      <>
                      <div className="interpolation">
                        <button
                          className={`button-no-interpolation ${interpolation === "none" ? "active" : ""}`}
                          onClick={() => setInterpolation("none")}
                        >
                          None
                        </button>
                        <button
                          className={`button-bicubic ${interpolation === "bicubic" ? "active" : ""}`}
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
                        width: originalSize ? originalSize.width * scale : undefined,
                        height: originalSize ? originalSize.height * scale : undefined,
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
                          width={originalSize ? originalSize.width * scale : undefined}
                          style={{
                            imageRendering: interpolation === "none" ? "pixelated" : "auto",
                            transform: "translateZ(0)", // Force GPU acceleration
                          }}
                        />
                      </div>

                      {displayUpscaledImageSrc && isUpscaleClicked && !selectedForDeletion && upscaledImageSrc && (
                        <div
                          className="image-container scaled-up"
                          style={{
                            width: `${100 - left}%`,
                            left: `${left}%`,
                          }}
                        >
                          <img
                            style={{
                              left: originalSize ? ((originalSize.width * scale * left) / 100) * -1 : undefined,
                              ...improvedScaledImageStyles
                            }}
                            alt="Upscaled"
                            src={upscaledImageSrc}
                            width={originalSize ? originalSize.width * scale : undefined}
                          />
                        </div>
                      )}

                    </div>

                    

                    {isLoaderVisible && (<div className="loader"></div>)}
                    {isProgressBarVisible && <ProgressBar />}
                  </div>
                </div>
              )}
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
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                )}

                {src && !isUpscaleClicked && (
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
                          <button
                            className="download-button-jpg"
                            data-format="jpg"
                            onClick={updateDownloadFormat}
                          >
                            Download .jpg
                          </button>

                          <button
                            className="download-button-png"
                            data-format="png"
                            onClick={updateDownloadFormat}
                          >
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
          <ol className="how-it-works-list">
            <li>Upload an image.</li>
            <li>Choose the scale you need — 2x, 3x, or 4x.</li>
            <li>Click the "Upscale image" button.</li>
            <li>Get your upscaled image! You can drag the slider left and right to see it before and after, 
              and download the upscaled image in "jpg" or "png" format.</li>
          </ol>
        </div>

        <div className="how-it-works-right">
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
