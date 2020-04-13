let loadingText = "";
let loadingProgress = 0;
let counter = 0;
const loadingHandler = setInterval(() => {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    if (counter % 4 === 0) {
      loadingText = "loading";
    } else {
      loadingText = "." + loadingText + ".";
    }

    document.getElementById("loadingText").innerHTML = loadingText;
  } else {
    clearInterval(loadingHandler);
  }
  counter++;
}, 1000);

console.log("OKE")