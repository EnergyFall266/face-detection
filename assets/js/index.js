const video = document.getElementById('video')

const startVideo = () => {
  navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    if (Array.isArray(devices)) {
      devices.forEach(device => {
        if(device.kind === 'videoinput') {
          console.log(device.label)
          // if(device.label.includes('6689')) {
            navigator.getUserMedia(
              { video: {
                deviceId: device.deviceId
              }},
              stream => video.srcObject = stream,
              error => console.error(error)
            )
          // }	
        }
      })
    
    }
  })
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./assets/lib/face-api.js/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./assets/lib/face-api.js/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./assets/lib/face-api.js/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./assets/lib/face-api.js/models'),
  faceapi.nets.ageGenderNet.loadFromUri('./assets/lib/face-api.js/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/lib/face-api.js/models')
]).then(startVideo)

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  const canvasSize = {
    width: video.width,
    height: 760
  }
  faceapi.matchDimensions(canvas, canvasSize)
  document.body.appendChild(canvas)
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(
        video, 
        new faceapi.TinyFaceDetectorOptions({  scoreThreshold: 0.6})
      )
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()

    const resizedDetections = faceapi.resizeResults(detections, canvasSize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    resizedDetections.forEach(detection => {
      const { age, gender, genderProbability} = detection
      new faceapi.draw.DrawTextField([
        `${parseInt(age, 10)} anos`,
        `${gender} (${parseInt(genderProbability * 100, 10)})`
      ], detection.detection.box.topRight).draw(canvas)
    })
  }, 100)

})