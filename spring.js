class Spring {
  constructor(style,constraint,anchorA,anchorB,tension) {
    this.c = constraint;
    // TODO: find a proper way to derive a rectangular body's width and height
    try {
      if (typeof this.c.bodyA === "undefined" || typeof this.c.bodyB === "undefined") {
        throw new Error("Please define the constraint's bodyA and bodyB.");
      } else if (this.c.bodyA.angle !== 0 || this.c.bodyB.angle !== 0) {
        throw new Error("Please don't rotate bodyA or bodyB before accessing this class.");
      }
    } catch (e) {
      console.error(e.message);
    }
    // FIX: can't attach more than one spring to a body because properties are added
    //      to the body objects? meh. why not just accept that.
    // TODO: find the best default anchor based on their relative position
    //       (requires users not to use Mater.Body.translate() after class initialisation)

    // I added 0.001 to avoid multiplying by 0.
    this.tension = tension ? tension + 0.001 : 1.5;
    this.c.bodyA.anchor = anchorA || 'north';
    this.c.bodyB.anchor = anchorB || 'north';
    this.c.bodyA.width  = this.c.bodyA.bounds.max.x - this.c.bodyA.bounds.min.x;
    this.c.bodyA.height = this.c.bodyA.bounds.max.y - this.c.bodyA.bounds.min.y;
    this.c.bodyB.width  = this.c.bodyB.bounds.max.x - this.c.bodyB.bounds.min.x;
    this.c.bodyB.height = this.c.bodyB.bounds.max.y - this.c.bodyB.bounds.min.y;
    this.l = style.linewidth || 1;
    // Matter.Bounds.contains(this.c.bodyA.bounds, this.c.pointA);
  }

  getAnchor(body) {
    if ( typeof body.type   === "undefined"
      || body.type !== "body"
      || typeof body.anchor === "undefined"
      || typeof body.width  === "undefined"
      || typeof body.height === "undefined") {
      throw new Error("body not valid: " + body);
    }
    switch (body.anchor) {
      case 'north':      return Matter.Vector.add(body.position, Matter.Vector.rotate({x: 0, y: body.height * -0.5},body.angle));
      case 'north east': return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * 0.5, y: body.height * -0.5},body.angle));
      case 'east':       return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * 0.5, y: 0},body.angle));
      case 'south east': return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * 0.5, y: body.height * 0.5},body.angle));
      case 'south':      return Matter.Vector.add(body.position, Matter.Vector.rotate({x: 0, y: body.height * 0.5},body.angle));
      case 'south west': return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * -0.5, y: body.height * 0.5},body.angle));
      case 'west':       return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * -0.5, y: 0},body.angle));
      case 'north west': return Matter.Vector.add(body.position, Matter.Vector.rotate({x: body.width * -0.5, y: body.height * -0.5},body.angle));
      default:
        throw new Error("The anchor '" + body.anchor + "' is not valid. "
          + "Please use either 'north', 'north east', 'east', 'south east', "
          + "'south', 'south west', 'west' or 'north west'.");
    };
  }

  draw(r) {
    let start, end, cp1, cp2;
    let v = (a) => Matter.Vector.rotate({x: 0, y: -this.tension}, Math.PI * a);
    let w = (a) => Matter.Vector.rotate({x: 0, y: this.tension * 0.5}, Math.PI * a);
    // console.log(this.c.bodyA.anchor);

    try {
      start = this.getAnchor(this.c.bodyA);
      end = this.getAnchor(this.c.bodyB);
      switch (this.c.bodyA.anchor) {
        case 'north':      cp1 = Matter.Vector.add(start, v(0));    break;
        case 'north east': cp1 = Matter.Vector.add(start, v(0.25)); break;
        case 'east':       cp1 = Matter.Vector.add(start, v(0.5));  break;
        case 'south east': cp1 = Matter.Vector.add(start, v(0.75)); break;
        case 'south':      cp1 = Matter.Vector.add(start, v(1));    break;
        case 'south west': cp1 = Matter.Vector.add(start, v(1.25)); break;
        case 'west':       cp1 = Matter.Vector.add(start, v(1.5));  break;
        case 'north west': cp1 = Matter.Vector.add(start, v(1.75)); break;
      };
      switch (this.c.bodyB.anchor) {
        case 'north':      cp2 = Matter.Vector.add(start, w(0));    break;
        case 'north east': cp2 = Matter.Vector.add(start, w(0.25)); break;
        case 'east':       cp2 = Matter.Vector.add(start, w(0.5));  break;
        case 'south east': cp2 = Matter.Vector.add(start, w(0.75)); break;
        case 'south':      cp2 = Matter.Vector.add(start, w(1));    break;
        case 'south west': cp2 = Matter.Vector.add(start, w(1.25)); break;
        case 'west':       cp2 = Matter.Vector.add(start, w(1.5));  break;
        case 'north west': cp2 = Matter.Vector.add(start, w(1.75)); break;
      };
    } catch (e) {
      console.error(e.message);
      Matter.Events.off(r, 'afterRender');
      return;
    }
    // Matter.Common.log('start', start, 'end', end, 'cp1', cp1, 'cp2', cp2);

    let ctx = r.context;
    Matter.Render.startViewTransform(r);
    ctx.font =  this.l * 20 + 'px serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.l * 0.5;
    ctx.fillStyle = 'black';
    ctx.fillText(Math.floor(this.tension),
      Math.ceil(cp1.x - this.l * 10), Math.ceil(cp1.y - this.l * 30)
     );
    ctx.beginPath();
    ctx.ellipse(
      Math.ceil(cp1.x * 100)/100,
      Math.ceil(cp1.y * 100)/100,
      this.l * 10, this.l * 10, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = this.l * 0.5;
    ctx.strokeStyle = 'gray';
    ctx.moveTo(Math.ceil(cp1.x), Math.ceil(cp1.y));
    ctx.lineTo(Math.ceil(start.x), Math.ceil(start.y));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(
      Math.ceil(cp2.x * 100)/100,
      Math.ceil(cp2.y * 100)/100,
      2, 2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.lineWidth = this.l;
    ctx.beginPath();
    ctx.moveTo(Math.ceil(start.x), Math.ceil(start.y));
    ctx.bezierCurveTo(
     Math.ceil(cp1.x * 100)/100,
     Math.ceil(cp1.y * 100)/100,
     Math.ceil(cp2.x * 100)/100,
     Math.ceil(cp2.y * 100)/100,
     Math.ceil(end.x * 100)/100,
     Math.ceil(end.y * 100)/100);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    Matter.Render.endViewTransform(r);
  }

  update(r) {
    // Matter.Common.log(this.c.bodyA);
    Matter.Events.on(r, 'afterRender', () => this.draw(r));
  }
}

