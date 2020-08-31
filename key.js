class Keyboard {
  constructor (style, x, y, lw, lh, bp, bw, bh, gh) {
    // Using millimeter values as pixels would result in a low resolution image, so let's use a tenfold.
    this.pos = Matter.Vector.create(x * 10 || 0, y * 10 || 0);
    this.lh  = lh * 10 ||  180;
    this.lw  = lw * 10 || 3500;
    this.bh  = bh * 10 || this.lh;
    this.bw  = bw * 10 || this.bh * 3;
    this.gh  = gh * 10 || this.lh * 1.2;
    this.spacing = this.lh * 0.3;
    this.gw  = this.lw + this.lh + (this.gh * 0.2) + this.spacing;

    this.back  = this.pos.x + this.gw * 0.5 - this.gh * 0.2;
    this.front = this.pos.x + this.gw * -0.5;

    let bpoint = bp * 10 || this.lw * 0.36;
    this.bp = {
      x: this.front + (this.lh * 0.5) + bpoint,
      y: (this.bh + (this.lh * 0.3)) * -1
    };

    this.release = false;
    this.pressed = false;

    this.style = style || { fillStyle: 'transparent', strokeStyle: 'black', lineWidth: 8 };
    this.group = Matter.Body.nextGroup(true);
    this.c = Matter.Composite.create({ label: 'keyframe' });

    let balancepath = [
      0, this.bh * 0.3, 
      this.bh * 0.3, 0,
      this.bw - this.bh * 0.5, 0,
      this.bw, this.bh * 0.3,
      this.bw, this.bh,
      0, this.bh
    ].join(' ');

    let groundpath = [
      0, this.gh * 0.2, 
      this.gh * 0.2, 0,
      this.gw, 0,
      this.gw, this.gh,
      0, this.gh
    ].join(' ');

    let leverpath = [
      0, 0,
      this.lw - this.lh, 0,
      this.lw - this.lh, this.lh * 0.8,
      0, this.lh
    ].join(' ');

    // TODO: review resulting balancepoint,
    // lever - ground chamfer - keywell front - balancepoint - pin width) * -0.5
      // x: (this.lw - (this.gh * 0.2) - (this.lh * 0.5) - this.bp - (this.lh * 0.1)) * 0.5,

    // on a rectangle, I would use
    // x = this.front + (this.lh * 0.5) + ((this.lw - tail) * 0.5)
    //              keywell front  +  (lever - tail)   * 0.5
    // and
    // y = this.lh * -0.65 - this.bh
    // but the postion is relative to the middle of the area
    // so it seems nescessary to use Body.translate() on a
    // tapered shape
    let lever = Matter.Bodies.fromVertices(0,0,
      Matter.Vertices.fromPath(leverpath), {
        render: this.style
      }
    );

    let tail = Matter.Bodies.rectangle(0,0,
      this.lh, this.lh * 0.4, {
        restitution: 0,
        render: this.style
      }
    );

    let keytop = Matter.Bodies.rectangle(this.lh * -0.1,this.lh * -0.1,
      bpoint * 0.8, this.lh * 0.2, {
        chamfer: { radius: this.lh * 0.1 },
        render: this.style
      }
    );

    let keyfront = Matter.Bodies.rectangle(this.lh * -0.1,0,
      this.lh * 0.1, this.lh, {
        render: this.style
      }
    );

    // TODO: don't use bounds here: yet put all bodies at (0, 0) without rotation,
    //       then measure the difference for each x and y between max and min
    //       save these in Body.width and Body.height, and then translate and rotate at will
    let leveroffset = Matter.Vector.add(lever.position,
      Matter.Vector.sub(
        {
          x: this.front + (this.lh * 0.5) + this.spacing * 0.5,
          y: this.lh * -1.2 - this.bh
        },lever.bounds.min)
    );

    Matter.Body.translate(lever, leveroffset);

    Matter.Body.translate(tail,
      Matter.Vector.add(lever.bounds.max,
        {x: this.lh * 0.5, y: this.lh * -0.4}
      ));

    Matter.Body.translate(keytop,
      Matter.Vector.add(lever.bounds.min,
        {x: bpoint * 0.39, y: 0}
      ));
    Matter.Body.translate(keyfront,
      Matter.Vector.add(lever.bounds.min,
        {x: this.lh * 0.1, y: this.lh * 0.5}
      ));
    let key = Matter.Body.create({
      label: 'lever',
      friction: 1,
      restitution: 0,
      collisionFilter: { group: this.group },
      // isStatic: true,
      parts: [ lever, tail,
        keyfront, keytop
      ],
    });

    let balance = Matter.Body.create({
      collisionFilter: { group: this.group },
      parts: [
        Matter.Bodies.rectangle(
          this.bp.x - this.lh * 0.07,
          this.bp.y,
          this.lh * 0.14,
          this.lh * 1.6, {
            chamfer: { radius: this.lh * 0.07 },
            label: 'balancepin',
            render: this.style
          }
        ),
        Matter.Bodies.fromVertices(
          this.bp.x + (this.bw * 0.2),
          (this.bh) * -0.5,
          Matter.Vertices.fromPath(balancepath), {
            label: 'balance',
            render: this.style
          }
        ),
        ],
      isStatic: true,
    });

    Matter.Composite.add(this.c, balance);
    Matter.Composite.add(this.c, key);

    Matter.Composite.add(this.c, Matter.Constraint.create({
      bodyA:  balance,
      pointA: {x: this.bw * -0.19, y: this.bh * -0.6},
      bodyB:  key,
      pointB: { x: -(key.position.x - key.bounds.min.x) + bpoint, y: this.lh * 0.5},
      stiffness: 1,
      length: 0,
      render: { visible: false }
     })
    );

    Matter.Body.rotate(key, Math.PI * 0.01, { x: this.bp.x, y: this.bp.y });

    // bodies that may collide with the key
    let keyframe = Matter.Body.create({
      parts: [
        // ground
        Matter.Bodies.fromVertices(
          this.pos.x + this.gh * -0.2,
          this.gh * 0.5,
          Matter.Vertices.fromPath(groundpath), {
            label: 'ground',
            render: this.style
          }
        ),
        // keywell front
        Matter.Bodies.rectangle(
          this.front + this.lh * 0.25,
          this.bh * -0.7,
          this.lh * 0.5,
          this.bh * 1.4, {
          render: this.style
        }),
        // key rest
        Matter.Bodies.rectangle(
          this.back - this.lh,
          this.lh * -0.3,
          this.lh * 2,
          this.lh * 0.6, {
          render: this.style
        }),
        // "rack"
        Matter.Bodies.rectangle(
          this.back - this.lh * 0.25,
          this.lh * -1.3,
          this.lh * 0.5,
          this.lh * 1.4, {
          render: this.style
        }),
        // key stop
        Matter.Bodies.rectangle(
          this.back - this.lh * 0.5,
          this.lh * -2.5,
          this.lh,
          this.lh, {
          render: this.style
        }),
      ],
      isStatic: true,
    });
    Matter.Composite.add(this.c, keyframe);

    let keyrestfelt = Matter.Composites.softBody(
      0,0, 10, 2, 0, 0, true,
      this.lh * 0.05, {
        friction: 0.05,
        frictionStatic: 0.1,
        restitution: 0,
        // isStatic: true,
        render: this.style
      }, { stiffness: 0.4 }
    );

    Matter.Composite.translate(keyrestfelt, Matter.Vector.add(this.pos,{x: this.back - this.lh * 1.6, y: this.lh * -0.8}));

    // TODO: maybe attach these to the rest/stop blocks
    // TODO: turn this in a utility function
    let keyrestfeltlength = keyrestfelt.bodies.length * 0.5;
    let keyrestfeltconstr = Array.from({length: keyrestfeltlength},
      (_,i) => Constraint.create({
        bodyA:  keyrestfelt.bodies[keyrestfeltlength + i],
        pointA: {x: 0, y: this.lh * 0.05},
        pointB: Matter.Vector.add(this.pos,
          {x: this.back - this.lh * 1.6 + i * (this.lh * 0.1), y: this.lh * -0.6}),
        // pointB: {x: this.back - this.lh * 0.5 + i * (this.lh * 0.1), y: this.pos.y - this.lh * 0.6},
        stiffness: 0.5,
        length: 0,
        render: { visible: false }
        // render: { strokeStyle: 'red', lineWidth: 8 }
      }));

    keyrestfeltconstr.forEach(c => Matter.Composite.add(this.c, c));
    Matter.Composite.add(this.c, keyrestfelt);
    Matter.Composite.translate(this.c, this.pos);

    // let keystopfelt = Matter.Composites.softBody(this.back - this.lh * 1.1, this.lh * -2, 3, 1, 0, 0, true, this.lh * 0.1, {
    //   friction: 0.05,
    //   frictionStatic: 0.1,
    //   // isStatic: true,
    //   render: this.style
    // });
    // Matter.Composite.translate(keystopfelt, this.pos);
    // Matter.Composite.add(this.c, keystopfelt);
    // Matter.Composite.add(this.c, Matter.Constraint.create({
    //   pointA: {x: this.back - this.lh * 0.5, y: this.pos.y - this.lh * 2.1},
    //   bodyB:  keystopfelt.bodies[keystopfelt.bodies.length -1],
    //   pointB: {x: 0, y: 0},
    //   stiffness: 0.8,
    //   length: this.lh * 0.2,
    //   render: { visible: false }
    // }));
    // Matter.Composite.add(this.c, Matter.Constraint.create({
    //   pointA: {x: this.back - this.lh * 1.1, y: this.pos.y - this.lh * 2.1},
    //   bodyB:  keystopfelt.bodies[0],
    //   pointB: {x: 0, y: 0},
    //   stiffness: 0.8,
    //   length: this.lh * 0.2,
    //   render: { visible: false }
    // }));
  }

  applyf() {
    if (this.c.bodies[1].angle < 0.0435) {
      Matter.Body.applyForce(
        this.c.bodies[1],
        Matter.Vector.add( this.c.bodies[1].position, {x: -this.lw * 0.3, y: 0}),
        {x: 0, y: this.c.bodies[1].area * 0.000008}
      );
    } else if (!this.release) {
      Matter.Body.applyForce(
        this.c.bodies[1],
        Matter.Vector.add( this.c.bodies[1].position, {x: -this.lw * 0.3, y: 0}),
        {x: 0, y: this.c.bodies[1].area * 0.000001}
      );
    }
  }

  press(engine) {
    if (this.release) {
      Matter.Events.off(engine, 'beforeUpdate');
      this.release = false;
      this.pressed = false;
    } else if (!this.pressed) {
      // how do I keep track of this anonymous callback subscription?
      // let events = Array.from(engine.events.beforeUpdate, f => f.toString());
      // Matter.Common.log(events.includes('() => this.press(engine)'));
        Matter.Events.on(engine, "beforeUpdate", () => this.press(engine));
        this.pressed = true;
    }
    if (this.pressed) this.applyf();
  }
}
