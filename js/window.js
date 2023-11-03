import Html from './html.js';                                                                                                                                                                                        //ඞඞඞ you have been amogusedඞ
import { nanoid } from './nanoid.js';

let windowList = [];

// TODO: move this function inside of the window class, 
//       and make it so instead of a parameter "window", it just uses "this"
function focusWindow(window) {
    // Bring this id to the front
    let index = windowList.indexOf(window);
    if (index !== -1) { windowList.splice(index, 1); }
    windowList.push(window);

    // Brings window to front and set active window
    for (let i = 0; i < windowList.length; i++) {
        const e = windowList[i];

        e.active = false
        if (e == window) e.active = true;

        e.zIndex = i;
        e.applyParameters();
    }
}

// TODO: Move this function inside of the window class,
//       and make it use the class variables, for example instead of hardcoding min-width to 300, it should use this.width
//       Also make it create new class varaibles like this.minimizeButton, so that we can use this.minimizeButton instead of this.window.query(`#minimize-${this.id}`);
function createWindow(elm, title) {
    let obj = {};
    if (elm instanceof HTMLElement) {
        obj.id = nanoid(5);
        obj.window = new Html("div")
            .class("window", "glass", "active")
            .id(`window-${obj.id}`)
            .style({ "min-width": 300 + "px", "min-height": 0 + "px", "position": "absolute", "left": 0 + "px", "top": 0 + "px", "user-select": "none" })
            .appendMany(
                new Html("div").class("title-bar").id(`title-bar-${obj.id}`)
                    .appendMany(
                        new Html("div").class("title-bar-text").id(`title-${obj.id}`).text(title),
                        new Html("div").class("title-bar-controls").id(`title-bar-controls-${obj.id}`)
                            .appendMany(
                                new Html("button").attr({ "aria-label": "Minimize" }).id(`minimize-${obj.id}`),
                                new Html("button").attr({ "aria-label": "Maximize" }).id(`maximize-${obj.id}`),
                                new Html("button").attr({ "aria-label": "Close" }).id(`close-${obj.id}`)
                            )
                    ),

                new Html("div").class("window-body", "has-space").id(`content-${obj.id}`).append(new Html("p").text("baller"))
            )
            .appendTo(elm);
        return obj;
    } else {
        throw Error("Invalid element.");
    }
}

export default class Window {
    constructor(elm, title) {
        const windowObj = createWindow(elm, title); // Create window

        // Class variables
        this.id = windowObj.id;
        this.window = windowObj.window;
        this.dragging = false;
        this.posX = 0;
        this.posY = 0;
        this.width = 300;
        this.height = 0;
        this.focused = false;
        this.zIndex = 0;
        this.maximized = false;


        windowList.push(this);

        // Misc variables

        const closeButton = this.window.query(`#close-${this.id}`);
        const minimizeButton = this.window.query(`#minimize-${this.id}`);
        const maximizeButton = this.window.query(`#maximize-${this.id}`);
        const titleBar = this.window.query(`#title-bar-${this.id}`);

        // Set titlebar actions
        closeButton.addEventListener("click", () => { 
            this.window.cleanup();
            let index = windowList.indexOf(this);
            if (index !== -1) { windowList.splice(index, 1); }
        });

        maximizeButton.addEventListener("click", () => {
            this.maximized = !this.maximized;
            this.applyParameters();
        })

        // Handle this.dragging
        document.addEventListener("mousemove", (e) => {
            if (this.dragging) {
                const deltaX = e.clientX - this.initialX;
                const deltaY = e.clientY - this.initialY;

                const currentLeft = this.posX;
                const currentTop = this.posY;

                this.posX = currentLeft + deltaX;
                this.posY = currentTop + deltaY;

                this.initialX = e.clientX;
                this.initialY = e.clientY;
                
                this.applyParameters();
            }
        })

        titleBar.addEventListener("touchstart", (e) => this.startGrab(e));
        titleBar.addEventListener("mousedown", (e) => this.startGrab(e));
        this.window.elm.addEventListener("mousedown", (e) => focusWindow(this));

        document.addEventListener("mouseup", () => { this.dragging = false; });
        document.addEventListener("touchend", () => { this.dragging = false; });
    }

    startGrab(e) {
        // Don't initialize drag, if user clicked on the title bar controls
        const divRect = document.getElementById(`title-bar-controls-${this.id}`).getBoundingClientRect();
        if (e.clientX >= divRect.left && e.clientX <= divRect.right &&
            e.clientY >= divRect.top && e.clientY <= divRect.bottom) {
            return;
        }      

        // initialize drag
        this.dragging = true;
        this.initialX = e.clientX;
        this.initialY = e.clientY;
    }

    applyParameters() {
        if (this.maximized) {
            // If the window is maximized, override the normal size with the entire screen
            this.window.elm.style.left = "0px";
            this.window.elm.style.top = "0px";

            document.getElementById(`content-${this.id}`).style["min-width"] = (window.innerWidth) + "px";
            document.getElementById(`content-${this.id}`).style["min-height"] = (window.innerHeight) + "px";
        }else{
            // Otherwise position and size it according to the posX, posY, width and height variables
            this.window.elm.style.left = this.posX + "px";
            this.window.elm.style.top = this.posY + "px";

            document.getElementById(`content-${this.id}`).style["min-width"] = this.width;
            document.getElementById(`content-${this.id}`).style["min-height"] = this.height;
        }

        // Focus window
        document.querySelector(`#window-${this.id}`).classList.toggle("active", this.active);

        // Z index
        this.window.elm.style["z-index"] = this.zIndex;

        // Maximized
        document.getElementById(`maximize-${this.id}`).ariaLabel = this.maximized ? "Restore" : "Maximize";
    }
}