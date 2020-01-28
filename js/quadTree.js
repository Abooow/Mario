class QuadTree {
    static debug = false;

    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;

        this.points = [];
        this.divided = false;
    }

    static boundaryContains(boundary, point) {
        return point.x >= boundary[0] && point.x < boundary[0] + boundary[2] &&
               point.y >= boundary[1] && point.y < boundary[1] + boundary[3];
    }

    static boundaryIntersects(boundary, otherBoundary) {
        return boundary[0] + boundary[2] > otherBoundary[0] &&
               boundary[1] + boundary[3] >= otherBoundary[1] &&
               boundary[0] < otherBoundary[0] + otherBoundary[2] &&
               boundary[1] <= otherBoundary[1] + otherBoundary[3];
    }

    insert(point, object) {
        if (!QuadTree.boundaryContains(this.boundary, point))
            return false;

        if (this.points.length <= this.capacity) {
            this.points.push([point, object])
            return true;
        }
        else {
            if (!this.divided) {
                this.subdivide();
                this.divided = true;
            }
        }

        if (this.northWest.insert(point, object)) return true;
        if (this.northEast.insert(point, object)) return true;
        if (this.southWest.insert(point, object)) return true;
        if (this.southEast.insert(point, object)) return true;
    }

    getObjects() {
        let objects = [];

        for (let obj of this.points)
            objects.push(obj[1]);

        if (this.divided) {
            objects = [...objects, ...this.northWest.getObjects()];
            objects = [...objects, ...this.northEast.getObjects()];
            objects = [...objects, ...this.southWest.getObjects()];
            objects = [...objects, ...this.southEast.getObjects()];
        }

        return objects;
    }

    query(range) {
        if (QuadTree.debug) {
            noFill();
            strokeWeight(2);
            stroke('rgb(0, 255, 0)');

            rect(range[0], range[1], range[2], range[3]);
        }

        let found = [];

        if (QuadTree.boundaryIntersects(this.boundary, range)) {
            for (let point of this.points) {
                if (QuadTree.boundaryContains(range, point[0])) {
                    if (QuadTree.debug) {
                        fill(0);
                        noStroke();
                        circle(point[0].x, point[0].y, 5);
                    }

                    found.push(point[1]);
                }
            }
        }
        else {
            return [];
        }

        if (this.divided) {
            found = [...found, ...this.northWest.query(range)];
            found = [...found, ...this.northEast.query(range)];
            found = [...found, ...this.southWest.query(range)];
            found = [...found, ...this.southEast.query(range)];
        }

        return found;
    }

    subdivide() {
        let position = [this.boundary[0], this.boundary[1]];
        let size = [this.boundary[2] / 2, this.boundary[3] / 2];

        let nw = [position[0], position[1], size[0], size[1]];
        let ne = [position[0] + size[0], position[1], size[0], size[1]];
        let sw = [position[0], position[1] + size[1], size[0], size[1]];
        let se = [position[0] + size[0], position[1] + size[1], size[0], size[1]];

        this.northWest = new QuadTree(nw, this.capacity);
        this.northEast = new QuadTree(ne, this.capacity);
        this.southWest = new QuadTree(sw, this.capacity);
        this.southEast = new QuadTree(se, this.capacity);
    }

    draw() {
        noFill();
        strokeWeight(2);
        stroke('rgb(255, 0, 0)');

        rect(this.boundary[0], this.boundary[1], this.boundary[2], this.boundary[3]);

        if (this.divided) {
            this.northWest.draw();
            this.northEast.draw();
            this.southWest.draw();
            this.southEast.draw();
        }
    }
}