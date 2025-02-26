import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader';
import './App.css'
import axios from "axios";


function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("")
  const randomNumber = Math.floor(Math.random() * 3);

  const fetchAPI = async () => {
    try {
      const response = await axios.get("http://localhost:5051/api");
      
      console.log(response.data.name[randomNumber]); // Log the parsed JSON data
      setMessage(response.data.name[randomNumber]);
      //console.log(response.data.name);  // Check if the 'name' property exists
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <div>
        <p>
          {message}
        </p>
      </div>
      <div>
        <p>
          WELCOME TO THE APP
        </p>
      </div>
      <div>
            <ImageUploader />
      </div>
      <p className="read-the-docs">
        Click on the "Upload" button to test uploading an image
      </p>
    </>
  )
}

export default App
