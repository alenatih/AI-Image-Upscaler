import React from "react"

function Footer() {
    const getDynamicYear = () => {
        const date = new Date()
        const year = date.getFullYear()
        return year
    }

    const currentUrl = window.location.href // The URL of the current page
    const shareText = encodeURIComponent("Check out this awesome project!")

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?url=${encodeURIComponent(currentUrl)}&text=${shareText}`
    const twitterShareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${shareText}`
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&text=${shareText}`

    const handleFacebookShare = () => {
        window.open(facebookShareUrl, "_blank")
    }

    const handleTwitterShare = () => {
        window.open(twitterShareUrl, "_blank")
    }

    const handleLinkedinShare = () => {
        window.open(linkedinShareUrl, "_blank")
    }

    return (
        <>
            <div className="footer-title-container">
                <h2 className="footer-title">{getDynamicYear()} &copy; Image Upscaler</h2>
            </div>

            <div className="footer-navbar">
                <h3 className="footer-share">Share</h3>
                {/* <button className="footer-social" onClick={handleFacebookShare}>Facebook</button> */}
                <button className="footer-social" onClick={handleTwitterShare}>X (Twitter)</button>
                <button className="footer-social" onClick={handleLinkedinShare}>LinkedIn</button>
            </div>
        </>
    )
}

export default Footer
