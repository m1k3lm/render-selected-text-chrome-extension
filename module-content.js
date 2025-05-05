// Import necessary modules
import { parseText } from './parsers/index.js';
import { renderPrettifiedJSON, renderHTML } from './utils.js';

window.RSTCE = {
    renderSelectedText: (text) => {
        const jsonObj = parseText(text);

        if (jsonObj) {
            renderPrettifiedJSON(jsonObj);
        } else {
            renderHTML(text);
        }

        sendResponse({ status: 'success' });
    }
}