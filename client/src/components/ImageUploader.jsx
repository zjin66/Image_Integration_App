import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ImageUploader() {
    const [image2, setImage2] = useState(null); // Environment image
    const [imageUrl2, setImageUrl2] = useState('');
    const [backgroundSize, setBackgroundSize] = useState({ width: 0, height: 0 });
    const [integratedImageUrl, setIntegratedImageUrl] = useState(""); 
    const [shouldIntegrate, setShouldIntegrate] = useState(false);
    // Store multiple draggable images
    const [draggableImages, setDraggableImages] = useState([]);
    const [isIntegrating, setIsIntegrating] = useState(false);  // Track integration status
    const [statusMessage, setStatusMessage] = useState('');  // Optional: Status message for user feedback
    const PORT = 5051;

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleFileChange2 = async (event) => {
        const file2 = event.target.files[0];
        if (file2) {
            setImage2(file2);
            await handleUpload2(file2);
        }
    };

    const handleUpload = async (file) => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`http://localhost:${PORT}/uploads`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const img = new Image();
            img.src = response.data.url;
            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;

                // Add new draggable image
                setDraggableImages((prevImages) => [
                    ...prevImages,
                    {
                        id: Date.now(), // Unique identifier
                        src: response.data.url,
                        width: 150, // Default width
                        height: 150 / aspectRatio, // Maintain aspect ratio
                        position: { x: 50, y: 50 }, // Initial position
                    },
                ]);
            };
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleUpload2 = async (file) => {
        if (!file) {
            alert('Please select a file for the second image!');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`http://localhost:${PORT}/uploads`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImageUrl2(response.data.url);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        const screenWidth = window.innerWidth;
        const dynamicWidth = screenWidth * 0.8;
        const scaledHeight = (dynamicWidth * naturalHeight) / naturalWidth;
        setBackgroundSize({ width: dynamicWidth, height: scaledHeight });
    };

    const handleResize = () => {
        setBackgroundSize((prevSize) => {
            const aspectRatio = prevSize.width / prevSize.height;
            const newWidth = window.innerWidth * 0.8;
            const newHeight = newWidth / aspectRatio;
            return { width: newWidth, height: newHeight };
        });
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();

        const id = parseInt(e.dataTransfer.getData('id'), 10);
        const offsetX = parseInt(e.dataTransfer.getData('offsetX'), 10);
        const offsetY = parseInt(e.dataTransfer.getData('offsetY'), 10);

        const container = e.target.getBoundingClientRect();

        setDraggableImages((prevImages) =>
            prevImages.map((img) =>
                img.id === id
                    ? {
                          ...img,
                          position: {
                              x: Math.max(0, Math.min(e.clientX - offsetX - container.left, container.width - img.width)),
                              y: Math.max(0, Math.min(e.clientY - offsetY - container.top, container.height - img.height)),
                          },
                      }
                    : img
            )
        );
    };

    const handleMouseDown = (e, id) => {
        e.preventDefault();
        
        // Get initial click position relative to the image
        const startX = e.clientX;
        const startY = e.clientY;
        
        setDraggableImages((prevImages) =>
            prevImages.map((img) =>
                img.id === id
                    ? { ...img, isDragging: true, startX, startY, offsetX: img.position.x, offsetY: img.position.y }
                    : img
            )
        );
    };
    
    const handleMouseMove = (e) => {
        setDraggableImages((prevImages) =>
            prevImages.map((img) => {
                if (!img.isDragging) return img;
    
                const container = document.getElementById("playground").getBoundingClientRect();
    
                const newX = img.offsetX + (e.clientX - img.startX);
                const newY = img.offsetY + (e.clientY - img.startY);
    
                // Clamp position to stay within the container
                const clampedX = Math.max(img.width / 2, Math.min(newX, container.width - img.width / 2));
                const clampedY = Math.max(img.height / 2, Math.min(newY, container.height - img.height / 2));
    
                return {
                    ...img,
                    position: { x: clampedX, y: clampedY },
                };
            })
        );
    };
    
    const handleMouseUp = () => {
        setDraggableImages((prevImages) =>
            prevImages.map((img) => ({ ...img, isDragging: false }))
        );
    };
    
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleZoom = (id, zoomIn) => {
        setDraggableImages((prevImages) =>
            prevImages.map((img) =>
                img.id === id
                    ? {
                          ...img,
                          width: zoomIn ? Math.min(img.width + 20, 400) : Math.max(img.width - 20, 50),
                          height: zoomIn
                              ? Math.min(img.width + 20, 400) / (img.width / img.height)
                              : Math.max(img.width - 20, 50) / (img.width / img.height),
                      }
                    : img
            )
        );
    };

    const handleDeleteLastImage = () => {
        setDraggableImages((prevImages) => prevImages.slice(0, -1));
    };


    const integrateImages = async () => {
        setIsIntegrating(true);  // Start integration
        setStatusMessage('Integrating images... Please wait.');
    
        try {
            const response = await fetch(`http://localhost:${PORT}/generate-integrated-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    environmentImageUrl: imageUrl2, // The background image URL
                    imagesData: draggableImages.map(img => ({
                        imageUrl: img.src,  // Target image URL
                        position: img.position,  // Position on the playground
                        width: img.width,  // Width of the target image
                        height: img.height,  // Height of the target image
                    })),
                }),
            });

            console.log('This is the response', { response });
    
            if (!response.ok) {
                throw new Error('Image integration failed');
            }
    
            const data = await response.json();

            console.log('This is the data', data);

            const integratedImageUrl = data.integratedImageUrl;
    
            setIntegratedImageUrl(integratedImageUrl);  // Display the integrated image
            setStatusMessage('Image integration complete!');
        } catch (error) {
            console.error('Error during image integration:', error);
            setStatusMessage('Image integration failed. Please try again.');
        } finally {
            setIsIntegrating(false);  // End integration
        }
    };
    
    useEffect(() => {
        if (shouldIntegrate && !isIntegrating) {
          integrateImages();
          setShouldIntegrate(false);  // Prevents re-triggering
        }
    }, [shouldIntegrate, isIntegrating]);  // Ensure integration runs when shouldIntegrate is true
        


    return (
        <div>
            <h1>Upload and Display the Images</h1>

            {/* Image Upload Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5vw', width: '100%', padding: '2vw' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40vw', maxWidth: '400px' }}>
                    <h2>Target Image</h2>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40vw', maxWidth: '400px' }}>
                    <h2>Environment Image</h2>
                    <input type="file" onChange={handleFileChange2} />
                </div>
            </div>

            {/* Interactive Playground */}
            {imageUrl2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    <h2>Interactive Image Composition</h2>
                    {/* Wrap the entire playground in this div with an ID */}
                    <div
                        id="playground" 
                        style={{
                            position: 'relative',
                            width: `${backgroundSize.width}px`,
                            height: `${backgroundSize.height}px`,
                            border: '2px solid pink',
                            overflow: 'hidden', // Prevents draggable images from going outside
                        }}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {/* Background Image */}
                        <img
                            src={imageUrl2}
                            alt="Background"
                            onLoad={handleImageLoad}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Render Draggable Images */}
                        {draggableImages.map((img) => (
                        <div
                            key={img.id}
                            style={{
                                position: "absolute",
                                left: img.position.x,
                                top: img.position.y,
                                transform: "translate(-50%, -50%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {/* Draggable Image */}
                            <img
                                src={img.src}
                                alt="Draggable"
                                onMouseDown={(e) => handleMouseDown(e, img.id)}
                                style={{
                                    width: img.width,
                                    height: img.height,
                                    cursor: "grab",
                                }}
                            />

                            {/* Zoom Controls Positioned at the Bottom */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "-50px", // Moves controls to the bottom
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    gap: "5px",
                                    background: "rgba(255, 255, 255, 0.7)",
                                    padding: "5px",
                                    borderRadius: "5px",
                                }}
                            >              
                                <button onClick={() => handleZoom(img.id, true)}>+</button>
                                <button onClick={() => handleZoom(img.id, false)}>-</button>
                            </div>
                        </div>
                        ))}
                    </div>
                    <button onClick={handleDeleteLastImage}>Delete Last Image</button>
                    <div>
                        <button
                        onClick={() => setShouldIntegrate((prev) => !prev)}
                        disabled={isIntegrating}  // Disable the button while integrating
                        >
                            {isIntegrating ? 'Integrating...' : shouldIntegrate ? 'Cancel Integration' : 'Start Integration'}
                        </button>
                        <p>{statusMessage}</p>  {/* Show status message */}
                        <img id="integratedImage" style={{ width: '100%', maxWidth: '500px' }} src={integratedImageUrl} alt="Integrated Result" />
                    </div>
                </div>
            )}
            

        </div>
    );
}

export default ImageUploader;