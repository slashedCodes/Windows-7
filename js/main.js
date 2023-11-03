import Window from "./window.js";
import Html from "./html.js";

document.querySelector("#create-button").onclick = function() {
    new Window(document.querySelector("body"), "Test window");
}