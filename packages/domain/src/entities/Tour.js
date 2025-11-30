"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tour = void 0;
class Tour {
    constructor(props) {
        this.props = props;
    }
    get data() {
        // Return a new object to ensure all properties including optional ones are included
        return { ...this.props };
    }
}
exports.Tour = Tour;
