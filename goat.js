let height = 500, width = 500;
let lineWidth;
let buffer;

let line1;
let line2;
let line3;
let line4;

let rHeight;
let rWidth;
let mazeHeight;
let mazeWidth;

let scans = [];

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
    }
    
    setActive() {
        this.visited = true;
        this.tile.setActive();
    }
    
    setInactive() {
        this.tile.setInactive();
    }
    
    setTile(tile) {
        this.tile = tile;
    }
    isVisited() {
        return this.visited;
    }
}
class MazeTile {
    constructor(square, l, r, t, b, x, y) {
        this.square = square;
        this.l = l;
        this.r = r;
        this.t = t;
        this.b = b;
        this.x = x;
        this.y = y;
    }
    getLeft() {
        return l;
    }
    getRight() {
        return r;
    }
    getTop() {
        return t;
    }
    getBottom() {
        return b;
    }
    
    setLeft(l) {
        this.l = l;
    }
    setRight(r) {
        this.r = r;
    }
    setTop(t) {
        this.t = t;
    }
    setBottom(b) {
        this.b = b;
    }
    
    
    setInactive() {
        if (!this.square) throw new Error("Square not assigned.");
        this.square.setColor(Color.white);
    }
    setActive() {
        if (!this.square) throw new Error("Square not assigned.");
        this.square.setColor("#ff9c9c");
        add(this.square);
    }
    
    addTop() {
        if (!this.t) return;
        add(this.t);
    }
    addLeft() {
        if (!this.l) return;
        add(this.l);
    }
    addRight() {
        if (!this.r) return;
        add(this.r);
    }
    addBottom() {
        if (!this.b) return;
        add(this.b);
    }
    
    removeTop() {
        if (!this.t) return;
        remove(this.t);
    }
    removeLeft() {
        if (!this.l) return;
        remove(this.l);
    }
    removeRight() {
        if (!this.r) return;
        remove(this.r);
    }
    removeBottom() {
        if (!this.b) return;
        remove(this.b);
    }
    static addCoverTop(x, y) {
        let rect = new Rectangle(rWidth, lineWidth);
        rect.setColor(Color.white);
        rect.setPosition((x+1)*lineWidth+x*rWidth, y*(rHeight+lineWidth));
        add(rect);
    }
    static addCoverRight(x, y) {
        let rect = new Rectangle(lineWidth, rHeight);
        rect.setColor(Color.white);
        rect.setPosition((x+1)*(rWidth+lineWidth), (y+1)*lineWidth+y*rHeight);
        add(rect);
    }
}

function start() {
    mazeHeight = parseInt(prompt("Height of Maze?"))
    mazeWidth = parseInt(prompt("Width of Maze?"));
    
    while (!mazeHeight || !mazeWidth || mazeHeight <= 0 || mazeHeight > 50 || mazeWidth <= 0 || mazeWidth > 50) {
        console.log("Invalid input");
        mazeHeight = parseInt(prompt("Height of Maze?"))
        mazeWidth = parseInt(prompt("Width of Maze?"));
    }
    
    lineWidth = Math.min(6, Math.floor(150/Math.max(mazeHeight, mazeWidth)));
    buffer = Math.floor(lineWidth/2);
    
    rHeight = Math.ceil((height-((mazeHeight+1)*lineWidth))/mazeHeight);
    rWidth = Math.ceil((width-((mazeWidth+1)*lineWidth))/mazeWidth);
    height = rHeight*mazeHeight + lineWidth*(mazeHeight+1);
    width = rWidth*mazeWidth + lineWidth*(mazeWidth+1);
    let frequency = Math.min(150, Math.ceil(10000/(mazeHeight*mazeWidth)^2));
    
    setSize(width, height);
    
    let maze = Array(mazeHeight);
    for (let i = 0; i < mazeHeight; i++) {
        let arr = [];
        for (let i2 = 0; i2 < mazeWidth; i2++) arr.push(new Node(i, i2));
        maze[i] = arr;
    }
    setup(maze);
    
    console.log("Total number of squares: "+(mazeHeight*mazeWidth));
    console.log("Time per update / frequency: " + frequency+"ms");
    
    let gen = generate(maze);
    function fn() {
        if (!gen.next().value) {
            stopTimer(fn);
        }
    }
    setTimer(fn, frequency);
    
}

function setup(maze) {
    let background = new Rectangle(getWidth(), getHeight());
    background.setColor(Color.gray);
    add(background);
    
    for (let i = 0; i < mazeHeight; i++) {
        let scan = new Rectangle(getWidth()-2*lineWidth, rHeight);
        scan.setPosition(lineWidth, (i+1)*lineWidth + i*rHeight);
        scan.setColor(Color.gray);
        add(scan);
        scans.push(scan);
    }
    
    line1 = new Line(0, buffer, width, buffer);
    line2 = new Line(buffer, 0, buffer, height);
    line3 = new Line(width-buffer, 0, width-buffer, height);
    line4 = new Line(0, height-buffer, width, height-buffer);
    line1.setColor(Color.black);
    line2.setColor(Color.black);
    line3.setColor(Color.black);
    line4.setColor(Color.black);
    line1.setLineWidth(lineWidth);
    line2.setLineWidth(lineWidth);
    line3.setLineWidth(lineWidth);
    line4.setLineWidth(lineWidth);
    
    let openStart = new Rectangle(lineWidth, rHeight), openEnd = new Rectangle(lineWidth, rHeight);
    openStart.setColor(Color.white);
    openEnd.setColor(Color.white);
    openStart.setPosition(0, height-lineWidth-rHeight);
    openEnd.setPosition(width-lineWidth, lineWidth);
    add(openStart);
    add(openEnd);
    
    for (let i = 0; i < mazeHeight; i++) {
        for (let i2 = 0; i2 < mazeWidth; i2++) {
            let rect = new Rectangle(rWidth, rHeight);
            let y = (i+1)*lineWidth + i*rHeight;
            let x = (i2+1)*lineWidth + i2*rWidth;
            rect.setPosition(x, y);
            rect.setColor(Color.white);
            let left = null, top = null;
            if (i2!==0) {
                left = new Rectangle(lineWidth, rHeight+2*lineWidth);
                left.setPosition(i2*(rWidth+lineWidth), i*(rHeight+lineWidth));
                left.setColor(Color.black);
                maze[i][i2-1].tile.setRight(left);
            }
            if (i!==0) {
                top = new Rectangle(rWidth+2*lineWidth, lineWidth);
                top.setColor(Color.black);
                top.setPosition(i2*(rWidth+lineWidth), i*(rHeight+lineWidth));
                maze[i-1][i2].tile.setBottom(top);
            }
            maze[i][i2].setTile(new MazeTile(rect, left, null, top, null, i2, i));
        }
    }
    add(line1);
    add(line2);
    add(line3);
    add(line4);
    add(openEnd);
    add(openStart);
}

function* generate(maze) {
    if (!maze || !(maze instanceof Array)) {
        while (true) {
            console.log("Maze not given.");
            yield false;
        }
    } else {
        let hunt = true;
        let x = 0, y = maze.length-1;
        let current = maze[y][x];
        let scanY = 0;
        let top = !!Math.floor(Math.random()*2); //randomly true or false
        current.setActive();
        current.tile.addTop();
        current.tile.addLeft();
        current.tile.addRight();
        current.tile.addBottom();
        yield true;
        while (true) {
            if (hunt) {
                current.setInactive();
                let options = ['Top', 'Left', 'Right', 'Bottom'];
                if (x-1 < 0 || maze[y][x-1].isVisited()) options[1] = null;
                if (x+1 > maze[0].length-1  || maze[y][x+1].isVisited()) options[2] = null;
                if (y-1 < 0 || maze[y-1][x].isVisited()) options[0] = null;
                if (y+1 > maze.length-1 || maze[y+1][x].isVisited()) options[3] = null;
                options = options.filter(a => !!a);
                if (options.length) {
                    let next = options[Math.floor(Math.random()*options.length)];
                    switch (next) {
                        case 'Top':
                            current.tile.removeTop();
                            MazeTile.addCoverTop(x, y);
                            y--;
                            current = maze[y][x];
                            current.setActive();
                            current.tile.addTop();
                            current.tile.addLeft();
                            current.tile.addRight();
                            break;
                        case 'Left':
                            current.tile.removeLeft();
                            MazeTile.addCoverRight(x-1, y);
                            x--;
                            current = maze[y][x];
                            current.setActive();
                            current.tile.addTop();
                            current.tile.addLeft();
                            current.tile.addBottom();
                            break;
                        case 'Right':
                            current.tile.removeRight();
                            MazeTile.addCoverRight(x, y);
                            x++;
                            current = maze[y][x];
                            current.setActive();
                            current.tile.addTop();
                            current.tile.addRight();
                            current.tile.addBottom();
                            break;
                        case 'Bottom':
                            current.tile.removeBottom();
                            MazeTile.addCoverTop(x, y+1);
                            y++;
                            current = maze[y][x];
                            current.setActive();
                            current.tile.addLeft();
                            current.tile.addRight();
                            current.tile.addBottom();
                            break;
                    }
                } else {
                    hunt = false;
                    current = null;
                    scanY = top?0:maze.length-1;
                    while((top && scanY<maze.length-1 || !top && scanY!==0) && maze[scanY].every(e => e.isVisited())) scanY+=top*2-1;
                    scans[scanY].setColor(Color.yellow);
                }
            } else {
                scans[scanY].setColor(Color.gray);
                for (let i = 0; i < mazeWidth; i++) {
                    let options = ['Top', 'Left', 'Right', 'Bottom'];
                    if (maze[scanY][i].isVisited()) continue;
                    if (i-1 < 0 || !maze[scanY][i-1].isVisited()) options[1] = null;
                    if (i+1 > maze[0].length-1  || !maze[scanY][i+1].isVisited()) options[2] = null;
                    if (scanY-1 < 0 || !maze[scanY-1][i].isVisited()) options[0] = null;
                    if (scanY+1 > maze.length-1 || !maze[scanY+1][i].isVisited()) options[3] = null;
                    options = options.filter(a => !!a);
                    if (!options.length) continue;
                    let next = options[Math.floor(Math.random()*options.length)];
                    x = i, y = scanY;
                    current = maze[y][x];
                    current.setActive();
                    switch (next) {
                        case 'Top':
                            current.tile.removeTop();
                            MazeTile.addCoverTop(x, y);
                            current.tile.addBottom();
                            current.tile.addLeft();
                            current.tile.addRight();
                            break;
                        case 'Left':
                            current.tile.removeLeft();
                            MazeTile.addCoverRight(x-1, y);
                            current.tile.addTop();
                            current.tile.addRight();
                            current.tile.addBottom();
                            break;
                        case 'Right':
                            current.tile.removeRight();
                            MazeTile.addCoverRight(x, y);
                            current.tile.addTop();
                            current.tile.addLeft();
                            current.tile.addBottom();
                            break;
                        case 'Bottom':
                            current.tile.removeBottom();
                            MazeTile.addCoverTop(x, y+1);
                            current.tile.addLeft();
                            current.tile.addRight();
                            current.tile.addTop();
                            break;
                    }
                    hunt = true;
                    scanY = 0;
                    break;
                }
                if (current) {
                    top = !top;
                    yield true;
                    continue;
                }
                scanY++
                if (scanY>=mazeHeight) break;
                scans[scanY].setColor(Color.yellow);
            }
            yield true;
        }
        console.log("The maze has finished generating.");
        while (true) yield false;
    }
}
