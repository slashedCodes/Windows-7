import Html from './html.js';                                                                                                                                                                                        //ඞඞඞ you have been amogusedඞ
import { nanoid } from './nanoid.js';

let windowList = [];

export default class Window {
    constructor(elm, title) {
        // Class variables
        this.dragging = false;
        this.posX = 0;
        this.posY = 0;
        this.width = 300;
        this.height = 0;
        this.focused = false;
        this.zIndex = 0;
        this.maximized = false;
        this.title = title;
        this.parent = elm;

        this.createWindow(); // Create window
        windowList.push(this);

        // Misc variables

        this.closeButton = this.window.query(`#close-${this.id}`);
        this.minimizeButton = this.window.query(`#minimize-${this.id}`);
        this.maximizeButton = this.window.query(`#maximize-${this.id}`);
        this.titleBar = this.window.query(`#title-bar-${this.id}`);
        this.content = this.window.query(`#content-${this.id}`);

        // Set titlebar actions
        this.closeButton.addEventListener("click", () => {
            this.window.cleanup();
            let index = windowList.indexOf(this);
            if (index !== -1) { windowList.splice(index, 1); }
        });

        this.maximizeButton.addEventListener("click", () => {
            this.maximized = !this.maximized;
            this.applyParameters();
        })

        // Handle dragging
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

        this.titleBar.addEventListener("touchstart", (e) => this.startGrab(e));
        this.titleBar.addEventListener("mousedown", (e) => this.startGrab(e));
        this.window.elm.addEventListener("mousedown", (e) => this.focusWindow(this));

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

            this.content.style["min-width"] = (window.innerWidth) + "px";
            this.content.style["min-height"] = (window.innerHeight) + "px";
        } else {
            // Otherwise position and size it according to the posX, posY, width and height variables
            this.window.elm.style.left = this.posX + "px";
            this.window.elm.style.top = this.posY + "px";

            this.content.style["min-width"] = this.width;
            this.content.style["min-height"] = this.height;
        }

        // Focus window
        this.window.elm.classList.toggle("active", this.active);

        // Z index
        this.window.elm.style["z-index"] = this.zIndex;

        // Maximized
        this.maximizeButton.ariaLabel = this.maximized ? "Restore" : "Maximize";

        // Title
        document.getElementById(`title-${this.id}`).innerText = this.title;
    }

    createWindow() {
        if (this.parent instanceof HTMLElement) {
            this.id = nanoid(5);
            this.window = new Html("div")
                .class("window", "glass", "active")
                .id(`window-${this.id}`)
                .style({ "position": "absolute", "left": this.posX + "px", "top": this.posY + "px", "user-select": "none" })
                .appendMany(
                    new Html("div").class("title-bar").id(`title-bar-${this.id}`)
                        .appendMany(
                            new Html("div").class("title-bar-text").id(`title-${this.id}`).text(this.title),
                            new Html("div").class("title-bar-controls").id(`title-bar-controls-${this.id}`)
                                .appendMany(
                                    new Html("button").attr({ "aria-label": "Minimize" }).id(`minimize-${this.id}`),
                                    new Html("button").attr({ "aria-label": "Maximize" }).id(`maximize-${this.id}`),
                                    new Html("button").attr({ "aria-label": "Close" }).id(`close-${this.id}`)
                                )
                        ),

                    new Html("div")
                        .class("window-body", "has-space")
                        .id(`content-${this.id}`)
                        .style({ "min-width": this.width + "px", "min-height": this.height + "px" })
                        .append(new Html("p").text("Hello 7.css!"))
                )
                .appendTo(this.parent);
            return this;
        } else {
            throw Error("Invalid parent.");
        }
    }

    focusWindow() {
        // Bring this id to the front
        let index = windowList.indexOf(this);
        if (index !== -1) { windowList.splice(index, 1); }
        windowList.push(this);

        // Brings window to front and set active window
        for (let i = 0; i < windowList.length; i++) {
            const e = windowList[i];

            e.active = false
            if (e == this) e.active = true;

            e.zIndex = i;
            e.applyParameters();
        }
    }
}