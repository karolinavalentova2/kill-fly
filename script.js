"use strict";
//MOUSE CURSOR
document.body.style.cursor = "images/cursor2.png";

//FLIES CONTAINER
let flyContainer = document.querySelector("#fly-container");

//GSAP PLUGIN
gsap.registerPlugin(MotionPathPlugin);

//GET RANDOM INTEGER IN RANGE
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

//LEVEL CONFIGURATION VARIABLES
let numberOfFlies = 8;
let durationMin = 1;
let durationMax = 10;

//CREATE THE FLIES IN HTML
for (let i = 0; i < numberOfFlies; i++) {
  let flyImage = new Image();
  flyImage.src = "images/fly.png";
  flyImage.classList.add("fly");
  flyImage.setAttribute("id", "fly" + (i + 1));
  flyContainer.append(flyImage);
}

//ARRAY CONTAINING FLIES FROM HTML
let DOMflies = document.querySelectorAll(".fly");

//ARRAY COINTAING TWEEN OBJECT FOR EACH FLY
let GSAPFlies = [];

//CREATING THE ANIMATION FOR EACH FLY
for (let i = 0; i < DOMflies.length; i++) {
  GSAPFlies[i] = gsap.to(DOMflies[i], {
    duration: getRandomIntInclusive(durationMin, durationMax),
    repeat: -1,
    repeatDelay: 0,
    yoyo: true,
    ease: "power1.inOut",
    motionPath: {
      path: "#path"
    }
  });
}

//CLICK HANDLER FOR EACH FLY
DOMflies.forEach(function(fly, index) {
  fly.addEventListener("click", function() {
    GSAPFlies[index].kill();
    fly.src = "images/dead_fly.png";
  });
});
