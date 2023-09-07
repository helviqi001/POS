export default function FullImage({fullImage,closeFullscreen}){
    const stylefullscreenoverlay = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }
      console.log(FullImage);
      const styleFullImage = {
        position:"relative",
          maxWidth: "75%",
          maxHeight: "75%",
          top: "5%",
          left: "10%",
          // transform: "translate(-50%, -60%)",
      }
    return(
        <div className="fullscreen-overlay" onClick={closeFullscreen} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Space') {
            closeFullscreen();
          }}} role='button' tabIndex='0'
          style={stylefullscreenoverlay}
          >
          <img src={fullImage} alt="fullscreen-pic" className="fullscreen-image" style={styleFullImage}/>
        </div>
    )
}