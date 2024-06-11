import { generateCSS } from "./css";
import { generateRestyle } from "./restyle/index";

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// CODE STARTS HERE
// ************************************
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: { type: string; count: number }) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate-css") {
    figma.notify("Generating CSS...");
    await generateCSS();
  }

  if (msg.type === "generate-restyle") {
    figma.notify("Generating Restyle...");
    await generateRestyle()
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 400 });

console.clear();