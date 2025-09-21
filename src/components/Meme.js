import React, { useState, useEffect, useRef } from 'react';

const Meme = () => {
  // State for the current meme object
  const [meme, setMeme] = useState({
    topText: '',
    bottomText: '',
    randomImage: 'https://i.imgflip.com/1bij.jpg' // Default meme image
  });

  // State for text orientation
  const [orientation, setOrientation] = useState({
    vertical: 'top-bottom', // 'top-bottom' or 'left-right'
    horizontal: 'center' // 'left', 'center', 'right'
  });

  // State for drag functionality
  const [isDragMode, setIsDragMode] = useState(false);
  const [textPositions, setTextPositions] = useState({
    topText: { x: 50, y: 10 }, // percentage values
    bottomText: { x: 50, y: 90 }
  });
  const [isDragging, setIsDragging] = useState({ topText: false, bottomText: false });

  // State to hold all memes from API
  const [allMemes, setAllMemes] = useState([]);

  // Ref for the meme container to capture for download
  const memeRef = useRef(null);

  // useEffect to fetch memes from API when component mounts
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await fetch('https://api.imgflip.com/get_memes');
        const data = await response.json();
        setAllMemes(data.data.memes);
      } catch (error) {
        console.error('Error fetching memes:', error);
      }
    };

    fetchMemes();
  }, []);

  // Function to get a random meme image
  const getMemeImage = () => {
    if (allMemes.length > 0) {
      const randomNumber = Math.floor(Math.random() * allMemes.length);
      const url = allMemes[randomNumber].url;
      setMeme(prevMeme => ({
        ...prevMeme,
        randomImage: url
      }));
    }
  };

  // Function to handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMeme(prevMeme => ({
      ...prevMeme,
      [name]: value
    }));
  };

  // Function to handle orientation changes
  const handleOrientationChange = (event) => {
    const { name, value } = event.target;
    setOrientation(prevOrientation => ({
      ...prevOrientation,
      [name]: value
    }));
  };

  // Function to download the meme
  const downloadMeme = async () => {
    if (!memeRef.current) return;

    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the meme container
      const canvas = await html2canvas(memeRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading meme:', error);
      alert('Failed to download meme. Please try again.');
    }
  };

  // Drag functionality
  const handleMouseDown = (e, textType) => {
    if (!isDragMode) return;
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [textType]: true }));
  };

  const handleMouseMove = (e) => {
    if (!isDragMode || (!isDragging.topText && !isDragging.bottomText)) return;
    
    const memeContainer = memeRef.current;
    if (!memeContainer) return;

    const rect = memeContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain to container bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    if (isDragging.topText) {
      setTextPositions(prev => ({
        ...prev,
        topText: { x: constrainedX, y: constrainedY }
      }));
    } else if (isDragging.bottomText) {
      setTextPositions(prev => ({
        ...prev,
        bottomText: { x: constrainedX, y: constrainedY }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging({ topText: false, bottomText: false });
  };

  // Touch events for mobile
  const handleTouchStart = (e, textType) => {
    if (!isDragMode) return;
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [textType]: true }));
  };

  const handleTouchMove = (e) => {
    if (!isDragMode || (!isDragging.topText && !isDragging.bottomText)) return;
    
    const memeContainer = memeRef.current;
    if (!memeContainer) return;

    const rect = memeContainer.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    // Constrain to container bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    if (isDragging.topText) {
      setTextPositions(prev => ({
        ...prev,
        topText: { x: constrainedX, y: constrainedY }
      }));
    } else if (isDragging.bottomText) {
      setTextPositions(prev => ({
        ...prev,
        bottomText: { x: constrainedX, y: constrainedY }
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging({ topText: false, bottomText: false });
  };

  // Reset text positions when orientation changes
  useEffect(() => {
    if (orientation.vertical === 'top-bottom') {
      setTextPositions({
        topText: { x: 50, y: 10 },
        bottomText: { x: 50, y: 90 }
      });
    } else {
      setTextPositions({
        topText: { x: 10, y: 50 },
        bottomText: { x: 90, y: 50 }
      });
    }
  }, [orientation.vertical]);

  return (
    <main className="meme-container">
      <div className="form">
        <input
          type="text"
          placeholder={orientation.vertical === 'top-bottom' ? "Enter your top text here..." : "Enter your left side text here..."}
          className="form-input"
          name="topText"
          value={meme.topText}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder={orientation.vertical === 'top-bottom' ? "Enter your bottom text here..." : "Enter your right side text here..."}
          className="form-input"
          name="bottomText"
          value={meme.bottomText}
          onChange={handleChange}
        />
        
        <div className="orientation-controls">
          <div className="orientation-group">
            <label className="orientation-label">Text Position</label>
            <select
              name="vertical"
              value={orientation.vertical}
              onChange={handleOrientationChange}
              className="orientation-select"
            >
              <option value="top-bottom">Top & Bottom</option>
              <option value="left-right">Left & Right Sides</option>
            </select>
          </div>
          
          <div className="orientation-group">
            <label className="orientation-label">Text Alignment</label>
            <select
              name="horizontal"
              value={orientation.horizontal}
              onChange={handleOrientationChange}
              className="orientation-select"
            >
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
              <option value="right">Right Aligned</option>
            </select>
          </div>
        </div>
        
        <div className="drag-mode-toggle">
          <button
            className={`drag-toggle-button ${isDragMode ? 'active' : ''}`}
            onClick={() => setIsDragMode(!isDragMode)}
          >
            {isDragMode ? '🎯 Drag Mode ON' : '🎯 Drag Mode OFF'}
          </button>
          <p className="drag-instruction">
            {isDragMode ? 'Click and drag text to move it around' : 'Enable drag mode to move text freely'}
          </p>
        </div>

        <div className="button-group">
          <button
            className="form-button primary"
            onClick={getMemeImage}
          >
            Get a new meme image 🖼️
          </button>
          <button
            className="form-button secondary"
            onClick={downloadMeme}
          >
            Download Meme 💾
          </button>
        </div>
      </div>

      <div 
        className="meme" 
        ref={memeRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img src={meme.randomImage} className="meme-image" alt="Meme template" />
        <h2 
          className={`meme-text draggable ${isDragMode ? 'drag-enabled' : ''} ${isDragging.topText ? 'dragging' : ''}`}
          style={{
            left: `${textPositions.topText.x}%`,
            top: `${textPositions.topText.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'topText')}
          onTouchStart={(e) => handleTouchStart(e, 'topText')}
        >
          {meme.topText}
        </h2>
        <h2 
          className={`meme-text draggable ${isDragMode ? 'drag-enabled' : ''} ${isDragging.bottomText ? 'dragging' : ''}`}
          style={{
            left: `${textPositions.bottomText.x}%`,
            top: `${textPositions.bottomText.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'bottomText')}
          onTouchStart={(e) => handleTouchStart(e, 'bottomText')}
        >
          {meme.bottomText}
        </h2>
      </div>
    </main>
  );
};

export default Meme;
