"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOn = void 0;
class AddOn {
    constructor(props) {
        this.props = props;
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get shortDescription() {
        return this.props.shortDescription ?? null;
    }
    get price() {
        return this.props.price;
    }
    get isActive() {
        return this.props.isActive;
    }
    get displayOrder() {
        return this.props.displayOrder;
    }
    get createdAt() {
        return this.props.createdAt ?? null;
    }
    get updatedAt() {
        return this.props.updatedAt ?? null;
    }
    toJSON() {
        return {
            id: this.props.id,
            name: this.props.name,
            shortDescription: this.props.shortDescription,
            price: this.props.price,
            isActive: this.props.isActive,
            displayOrder: this.props.displayOrder,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
exports.AddOn = AddOn;
