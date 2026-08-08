// ==========================================
// AI VIDEO SURVEILLANCE
// ==========================================

let video;
let canvas;

let objectDetector = null;
let detections = [];

let videoReady = false;
let detectorReady = false;
let detecting = false;


// ==========================================
// SETUP
// ==========================================

function setup() {

    canvas = createCanvas(640, 480);
    canvas.parent("canvas-container");

    background(0);

    // Create video
    video = createVideo("video.mp4");

    video.hide();

    // Keep video looping
    video.elt.loop = true;

    // Required for inline playback
    video.elt.playsInline = true;

    // --------------------------------------
    // VIDEO LOADED
    // --------------------------------------

    video.elt.addEventListener("loadeddata", function () {

        videoReady = true;

        console.log("Video loaded successfully.");

        document.getElementById("status").innerHTML =
            "Status : Video Loaded";

    });


    // --------------------------------------
    // VIDEO ERROR
    // --------------------------------------

    video.elt.addEventListener("error", function () {

        console.error("Could not load video.mp4");

        document.getElementById("status").innerHTML =
            "Status : Video failed to load";

    });

}


// ==========================================
// DRAW
// ==========================================

function draw() {

    background(0);

    // --------------------------------------
    // DISPLAY VIDEO
    // --------------------------------------

    if (videoReady) {

        image(
            video,
            0,
            0,
            width,
            height
        );

    }

    else {

        fill(255);

        noStroke();

        textAlign(CENTER, CENTER);

        textSize(24);

        text(
            "Loading video...",
            width / 2,
            height / 2
        );

    }


    // --------------------------------------
    // DISPLAY DETECTIONS
    // --------------------------------------

    if (
        detecting &&
        detections.length > 0
    ) {

        drawDetections();

    }

}


// ==========================================
// START
// ==========================================

function start() {

    console.log("Start button clicked.");

    // --------------------------------------
    // CHECK VIDEO
    // --------------------------------------

    if (!videoReady) {

        document.getElementById("status").innerHTML =
            "Status : Video is still loading...";

        return;

    }


    // --------------------------------------
    // START VIDEO WITH AUDIO
    // --------------------------------------

    video.elt.muted = false;

    video.elt.volume = 1.0;

    video.elt.loop = true;

    video.elt.play()
        .then(function () {

            console.log(
                "Video started with audio."
            );

        })
        .catch(function (error) {

            console.error(
                "Video playback error:",
                error
            );

            document.getElementById("status").innerHTML =
                "Status : Click Start again to allow video playback";

        });


    // --------------------------------------
    // LOAD AI MODEL
    // --------------------------------------

    if (!detectorReady) {

        document.getElementById("status").innerHTML =
            "Status : Loading AI model...";

        objectDetector = ml5.objectDetector(
            "cocossd",
            modelLoaded
        );

    }

    else {

        detecting = true;

        document.getElementById("status").innerHTML =
            "Status : Detecting Objects";

        detectObjects();

    }

}


// ==========================================
// MODEL LOADED
// ==========================================

function modelLoaded() {

    console.log(
        "COCO-SSD model loaded."
    );

    detectorReady = true;

    detecting = true;

    document.getElementById("status").innerHTML =
        "Status : Detecting Objects";

    detectObjects();

}


// ==========================================
// DETECT OBJECTS
// ==========================================

function detectObjects() {

    if (!detecting) {

        return;

    }

    if (!videoReady) {

        return;

    }

    objectDetector.detect(
        video,
        gotDetections
    );

}


// ==========================================
// DETECTION RESULT
// ==========================================

function gotDetections(
    error,
    results
) {

    if (error) {

        console.error(
            "Object detection error:",
            error
        );

        document.getElementById("status").innerHTML =
            "Status : Detection Error";

        return;

    }


    detections = results;


    // --------------------------------------
    // OBJECT COUNT
    // --------------------------------------

    document.getElementById(
        "number_of_objects"
    ).innerHTML =
        "Objects Detected : " +
        detections.length;


    // --------------------------------------
    // DETECT AGAIN
    // --------------------------------------

    if (detecting) {

        detectObjects();

    }

}


// ==========================================
// DRAW DETECTION BOXES
// ==========================================

function drawDetections() {

    for (
        let i = 0;
        i < detections.length;
        i++
    ) {

        let object = detections[i];


        // ----------------------------------
        // VIDEO DIMENSIONS
        // ----------------------------------

        let videoWidth =
            video.elt.videoWidth;

        let videoHeight =
            video.elt.videoHeight;


        if (
            videoWidth === 0 ||
            videoHeight === 0
        ) {

            continue;

        }


        // ----------------------------------
        // SCALE COORDINATES
        // ----------------------------------

        let scaleX =
            width / videoWidth;

        let scaleY =
            height / videoHeight;


        let x =
            object.x * scaleX;

        let y =
            object.y * scaleY;

        let w =
            object.width * scaleX;

        let h =
            object.height * scaleY;


        // ----------------------------------
        // BOUNDING BOX
        // ----------------------------------

        noFill();

        stroke(0, 255, 0);

        strokeWeight(3);

        rect(
            x,
            y,
            w,
            h
        );


        // ----------------------------------
        // LABEL
        // ----------------------------------

        let confidence =
            Math.round(
                object.confidence * 100
            );


        let label =
            object.label +
            " " +
            confidence +
            "%";


        textSize(16);


        // Label background

        let labelWidth =
            textWidth(label) + 14;


        fill(0, 255, 0);

        noStroke();

        rect(
            x,
            y - 28,
            labelWidth,
            28
        );


        // Label text

        fill(0);

        textAlign(
            LEFT,
            CENTER
        );

        text(
            label,
            x + 7,
            y - 14
        );

    }

}


// ==========================================
// STOP DETECTION
// ==========================================

function stopDetection() {

    detecting = false;

    detections = [];


    document.getElementById(
        "status"
    ).innerHTML =
        "Status : Detection Stopped";


    document.getElementById(
        "number_of_objects"
    ).innerHTML =
        "Objects Detected : 0";

}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

function keyPressed() {

    // S = Start

    if (
        key === "s" ||
        key === "S"
    ) {

        start();

    }


    // X = Stop

    if (
        key === "x" ||
        key === "X"
    ) {

        stopDetection();

    }

}
