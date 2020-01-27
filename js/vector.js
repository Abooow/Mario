class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static arrayToVector(array) {
        if (array.length < 2) return new Vector(0, 0);

        return new Vector(array[0], array[1]);
    }

    toArray() {
        return [this.x, this.y];
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

        return this;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;

        return this;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;   

        return this;
    }

    mult(a, b) {
        if (b === undefined) {
            this.x *= a;
            this.y *= a;
        }
        else {
            this.x *= a;
            this.y *= b;   
        }

        return this;
    }

    div(scale) {
        this.x /= scale;
        this.y /= scale;

        return this;
    }
}