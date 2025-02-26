async function integrateWithAI(imageDataUrl) {
    try {
        const response = await fetch("http://localhost:5051/integrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageDataUrl }),
        });

        const result = await response.json();
        if (result.output) {
            setIntegratedImageUrl(result.output); // Update state with AI-processed image
        } else {
            console.error("Integration failed:", result);
        }
    } catch (error) {
        console.error("Error calling backend:", error);
    }
}