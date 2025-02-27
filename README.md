# Image_Integration_App

An app aims to do an smooth integration on the selected images. It runs on localhost's front end. The app provides two slots, one for uploading multiple target images and one for an environment image for the background. Then it will generate an integrated image according to what the user modfies on the playground that is shown after the user successfully uploads at least one target and environment image.

## Features
### Upload Image buttons
* [x] Buttons that are used to upload your target and environment images. Uploading new target images adds them to the playground, while uploading new environment images changes the current background image on the playground.
### Playground
Appears after the images are uploaded. Contains various features:
#### Dragging
 * [x] select and hold to drag the target images, release to stop the dragging.
 #### zoom in and zoom out
 Two buttons that comes along with the target image, 
  * [x] allows the user to zoom in and zoom out the target image to change its size.
 #### delete last target image
  * [x] Located on the bottom of the playground, allows the user to delete the last target image uploaded.
 #### integrate final image
  * [x] After the modification, click it to generate the final result shown on the playground
  * [ ] Smooth combination of the images
 ### Save
  * [x] AutoSave for uploaded images
  * [ ] Save button for the final integrated image
## Requirements
 * React and Express
 * Visual Studio Code 
## Installation
1. Click on the "Code" button and select "Download ZIP" to download the project files to local directory.
2. Open server.js, App.jsx and cd all the required things such as multer, axios, cors, html2canvas and etc.
3. run cmd on the server and client path, use npm run dev to start the portal.
4. copy the link given by the client cmd window
## Future Work
* Complete the integration methods to refine the final results
* Finish the saving options
* Replenish the app's UI and visuals
