"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
class Vehicle {
    constructor(props) {
        this.props = props;
    }
    get data() {
        return this.props;
    }
}
exports.Vehicle = Vehicle;
