class Finger {
  constructor (style, x, y, unit) {
    // Using millimeter values as pixels would result in a low resolution image, so let's use a tenfold.
    this.pos   = Matter.Vector.create(x * 10 || 0, y * 10 || 0);
    this.unit  = unit * 10 || 200;
    this.style = style || { fillStyle: 'transparent', strokeStyle: 'black', lineWidth: 8 };
    // this.mirror= hmirror || false;
    this.group = Matter.Body.nextGroup(true);
    this.timer = 80;
    this.time = this.timer;
    // TODO: multiply a unit vector in stead of this guesswork
    this.force= (this.unit * 0.001) ** 2 * (this.unit * 0.01);
    this.release = false;
    this.pressed = false;

    let composite = Matter.Composite.create({label: 'finger'});
    // these values will be scaled appropriatly afterwards
    let bodies = [
      Matter.Bodies.trapezoid(
        0, 50, 100, 400, 0.1, {
          collisionFilter: { group: this.group },
          // density: 0.1,
          friction: 1,
          restitution: 0,
          // isStatic: true,
          chamfer: { radius: [ 50, 50, 30, 30 ]},
          render: this.style
        }
      ),
      Matter.Bodies.trapezoid(
        0, 50, 80, 300, 0.1, {
          collisionFilter: { group: this.group },
          // density: 0.1,
          friction: 1,
          restitution: 0,
          // isStatic: true,
          chamfer: { radius: [ 40, 40, 20, 20 ]},
          render: this.style
        }
      ),
      Matter.Bodies.trapezoid(
        0, 50, 70, 200, 0.1, {
          collisionFilter: { group: this.group },
          // density: 0.1,
          friction: 1,
          restitution: 0,
          slop: 0,
          // isStatic: true,
          chamfer: { radius: [ 30, 30, 20, 20 ]},
          render: this.style
        }
      ),
     ];

    Matter.Composite.add(composite,bodies);
    Matter.Composite.scale(composite, this.unit * 0.01, this.unit * 0.01, this.pos);

    // composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options
    this.c = Matter.Composites.chain(
      composite, 0.25, -0.45, 0.25, 0.45, {
        label: 'finger',
        stiffness: 1,
        damping: 1,
        length:  0,
        angularStiffness: 1,
        render: { visible: false }
      }
    );

    Matter.Composite.add(this.c, Matter.Constraint.create({
      pointA: this.pos,
      bodyB:  this.c.bodies[0],
      pointB: { x: 0, y: this.unit * 2},
      stiffness: 1,
      damping: 0.5,
      length:  0,
      render: { visible: false }
    }));

    Matter.Composite.add(this.c, Matter.Constraint.create({
      pointA: Matter.Vector.add(this.pos,{x: 0, y: this.unit * -2}),
      bodyB:  this.c.bodies[0],
      pointB: { x: this.unit * -0.5, y: this.unit},
      stiffness: 0.2,
      damping:   0.5,
      length: this.unit * 2,
      render: { visible: false }
    }));

    Matter.Composite.add(this.c, Matter.Constraint.create({
      bodyA:  this.c.bodies[0],
      pointA: { x: this.unit * 0.5, y: 0},
      bodyB:  this.c.bodies[1],
      pointB: { x: this.unit * 0.5, y: 0},
      stiffness: 0.01,
      damping:   1,
      angularStiffness: 0.1,
      length: this.unit,
      // render: this.style,
      render: { visible: false }
    }));
    Matter.Composite.add(this.c, Matter.Constraint.create({
      bodyA:  this.c.bodies[0],
      pointA: { x: this.unit * -0.5, y: 0},
      bodyB:  this.c.bodies[1],
      pointB: { x: this.unit * -0.5, y: 0},
      stiffness: 0.008,
      damping:   1,
      angularStiffness: 0.1,
      length: this.unit,
      render: { visible: false }
    }));
    Matter.Composite.add(this.c, Matter.Constraint.create({
      bodyA:  this.c.bodies[1],
      pointA: { x: this.unit * 0.4, y: 0},
      bodyB:  this.c.bodies[2],
      pointB: { x: this.unit * 0.4, y: 0},
      stiffness: 0.03,
      damping:   1,
      angularStiffness: 0,
      length: this.unit,
      render: { visible: false }
    }));
    Matter.Composite.add(this.c, Matter.Constraint.create({
      bodyA:  this.c.bodies[1],
      pointA: { x: this.unit * -0.4, y: 0},
      bodyB:  this.c.bodies[2],
      pointB: { x: this.unit * -0.4, y: 0},
      stiffness: 0.02,
      damping:   1,
      angularStiffness: 0,
      length: this.unit,
      render: { visible: false }
    }));

    Matter.Composite.translate(this.c,this.pos);
    // Matter.Composite.rotate(this.c, Math.PI * 0.45, this.pos);

    Matter.Body.setAngle(this.c.bodies[0], Math.PI * 0.5);
    Matter.Body.setAngle(this.c.bodies[1], Math.PI * 0.7);
    Matter.Body.setAngle(this.c.bodies[2], Math.PI * 0.9);
    Matter.Body.setPosition(this.c.bodies[0], Matter.Vector.add(this.pos,{x: this.unit * 2, y: 0}));
    Matter.Body.setPosition(this.c.bodies[1], Matter.Vector.add(this.pos,{x: this.unit * 4.8, y: this.unit * 0.8}));
    Matter.Body.setPosition(this.c.bodies[2], Matter.Vector.add(this.pos,{x: this.unit * 6.2, y: this.unit * 2.4}));
    // Matter.Common.log(typeof this.time);
  }

  applyf(factor) {
    Matter.Body.applyForce(
      this.c.bodies[0],
      Matter.Vector.add( this.c.bodies[0].position, {x: this.unit * 1.5, y: this.unit}),
      {x: 0, y: this.force * factor * 40}
    );
    // if (this.c.bodies[1].angle < 2.5) Matter.Common.log(this.c.bodies[1].angle);
    if (this.c.bodies[1].angle < 3.5) {
      Matter.Body.applyForce(
        this.c.bodies[1],
        Matter.Vector.add( this.c.bodies[1].position, {x: this.unit * 1.5, y: this.unit}),
        {x: this.force * factor * -2, y: this.force * factor}
      );
    } else {
      // Matter.Common.log(this.c.bodies[1].angle);
      Matter.Body.applyForce(
        this.c.bodies[1],
        Matter.Vector.add( this.c.bodies[1].position, {x: this.unit * 1.5, y: this.unit}),
        {x: this.force * factor * 2, y: 0}
      );
    }
    if (this.c.bodies[2].angle < 5) {
      Matter.Body.applyForce(
        this.c.bodies[2],
        Matter.Vector.add( this.c.bodies[2].position, {x: this.unit * 2, y: this.unit}),
        {x: this.force * factor * -3, y: this.force * factor}
      );
    } else {
      Matter.Body.applyForce(
        this.c.bodies[2],
        Matter.Vector.add( this.c.bodies[2].position, {x: this.unit * 2, y: this.unit}),
        {x: this.force * factor * 3, y: 0}
      );
    }
  }

  press(engine) {
    if (!this.pressed) {
      // how do I keep track of this callback subscription?
      // let events = Array.from(engine.events.beforeUpdate, f => f.toString());
      // Matter.Common.log(events.includes('() => this.press(engine)'));
      Matter.Events.on(engine, "beforeUpdate", () => this.press(engine));
      this.pressed = true;
    }
    if (this.release) {
      this.time--;
      if (this.time > 0) {
        this.applyf(this.time/this.timer);
      }
      if (this.time === 0) {
        Matter.Events.off(engine, 'beforeUpdate');
        this.time = this.timer;
        this.release = false;
        this.pressed = false;
      }
    } else {
      this.applyf(2.5/this.c.bodies[1].angle);
    }
  }

  toggleStatic() {
    this.c.bodies.forEach(b => (b.isStatic) ? Matter.Body.setStatic(b, false) : Matter.Body.setStatic(b, true));
  }
}
