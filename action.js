var { Events, Engine, Render, Runner, Body, Composite, Composites, Common, Constraint, MouseConstraint, Mouse, World, Bodies, Vertices, Vector } = Matter;
var PianoActions = [];

class Action {
  constructor(properties){
    ({
      name: this.name,       // string
      id: this.id,           // string, cannot start with a number
      notes: this.notes,     // html, note range in Helmholtz notation
      octaves: this.octaves, // integer
      description: this.description // string
    } = properties || { name: 'name', id: 'id', notes: null, octaves: 5, description: 'This is a test.'});
    this.sourceLink = 'actions/' + this.name.replace(/\s/gi,'') + '.js';
    this.style = { fillStyle: 'transparent', strokeStyle: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black', lineWidth: 2 };
    this.engine = Engine.create();
    this.world  = this.engine.world;
    this.started = false;
    this.running = false;
    this.runner = Runner.create({
      delta: 1000 / 60,
      isFixed: false,
      enabled: true
    });
  }

  start() {
    if (!this.started) {
      console.log('start');
      this.init();
      this.started = true;
    }
    this.running = true;
    Runner.start(this.runner,this.engine);
    Render.lookAt(render,
      // { min: {x: -800, y: 0}, max: {x: 800, y: 800} }
      Composite.allBodies(this.world), { x: 20, y: 20}
    );
  }

  stop(){
    this.running = false;
    Runner.stop(this.runner);
  }
}
