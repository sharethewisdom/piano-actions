let dummy = Engine.create();
var render = Render.create({
  canvas: document.getElementById('demo'),
  engine:  dummy,
  options: {
    width:  window.innerWidth - 6,
    height: window.innerHeight - 100,
    pixelRatio: 1,
    background: 'transparent',
    wireframes: false,
  }
});

let testkeyboardone = new Action({
  name: "Test Keyboard One",
  id: "keyboard1",
  description: ""
},render);

testkeyboardone.init = () => {
  testkeyboardone.keyboards = Array.from({length: 2},
    (_,i) => new Keyboard(testkeyboardone.style,(i+1)*2.5,(i+1)*30,60+(i+1)*10,4+(i+1)*0.4,25)
  );
  World.add(testkeyboardone.world, testkeyboardone.keyboards.map(v => v.c));
};

testkeyboardone.push = () => {
  testkeyboardone.keyboards.forEach(v => {
    if (v.pressed && !v.release) v.release = true;
    v.press(testkeyboardone.engine)
  });
};
PianoActions.push(testkeyboardone);

let testkeyboardtwo = new Action({
  name: "Test Keyboard Two",
  id: "keyboard2",
  description: ""
},render);

testkeyboardtwo.init = () => {
  testkeyboardtwo.keyboards = Array.from({length: 2},
    (_,i) => new Keyboard(testkeyboardtwo.style,(i+1)*2.5,(i+1)*40,80+(i+1)*10,4+(i+1)*0.4,30)
  );
  World.add(testkeyboardtwo.world, testkeyboardtwo.keyboards.map(v => v.c));
};

testkeyboardtwo.push = () => {
  testkeyboardtwo.keyboards.forEach(v => {
    if (v.pressed && !v.release) v.release = true;
    v.press(testkeyboardtwo.engine)
  });
};
PianoActions.push(testkeyboardtwo);

if (window.location.hash.length > 0) {
  actionId = window.location.hash.slice(1);
} else {
  actionId = PianoActions[0].id;
}
let current = PianoActions.filter((action) => {
  return action.id === actionId;
})[0];
Render.run(render);
render.engine = current.engine;
current.start();

let menu = document.getElementsByTagName('action-group')[0];
PianoActions.forEach((a) => {
  let el = document.createElement('a');
  el.setAttribute('target', '_self');
  el.setAttribute('href', '#' + a.id);
  el.setAttribute('aria-checked', false);
  el.tabindex = -1;
  el.innerHTML = a.name;
  menu.appendChild(el);
});
document.body.appendChild(menu);

window.addEventListener('hashchange', () => {
  if (window.location.hash.length > 0) {
    actionId = window.location.hash.slice(1);
  } else {
    actionId = PianoActions[0].id;
  }
  let running = PianoActions.filter((action) => {
    return action.running === true;
  })[0];
  let current = PianoActions.filter((action) => {
    return action.id === actionId;
  })[0];
  if (typeof running !== 'undefined') {
    running.stop();
  }
  render.engine = dummy;
  current.start();
  render.engine = current.engine;
});

document.body.addEventListener('keydown', function initialFocus() {
  let tgroup = document.getElementsByTagName('action-group')[0];
  if (tgroup.hasAttribute('selected')) {
    let sel = tgroup.getAttribute('selected');
    let actions = Array.from(tgroup.querySelectorAll('a'));
    actions[sel].focus();
  }
  document.body.removeEventListener('keydown', initialFocus);
});

(function() {
  const VK_LEFT  = 37;
  const VK_UP    = 38;
  const VK_RIGHT = 39;
  const VK_DOWN  = 40;
  const VI_LEFT  = 72;
  const VI_UP    = 75;
  const VI_RIGHT = 76;
  const VI_DOWN  = 74;
  const SPACE    = 32;

  class actionGroup extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.actions = Array.from(this.querySelectorAll('a'));
      if (this.hasAttribute('selected')) {
        let selected = this.getAttribute('selected');
        this._selected = parseInt(selected);
        this.actions[selected].tabIndex = 0;
        this.actions[selected].setAttribute('aria-checked', true);
        this.actions[selected].focus();
      }
      this.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.addEventListener('Domcontentloaded', this.setAttribute('selected', 0));
      // this.addEventListener('load', this.actions.forEach(function(action){action.classList.add('visible')}));
    }
    handleKeyDown(e) {
      let parent = this.parentElement;
      let focus = document.getSelection().focusNode;
      let direction = "";
      switch(e.keyCode) {
        case SPACE: {
          e.preventDefault();
          if (window.location.hash.length > 0) {
            actionId = window.location.hash.slice(1);
          } else {
            actionId = PianoActions[0].id;
          }
          PianoActions.filter((action) => {
            return action.id === actionId;
          })[0].push();
          break;
         }
        case VI_UP:
        case VK_UP: {
          e.preventDefault();
          if (this._selected < 2) {
            this.selected = this.actions.length - 1;
          } else {
            this.selected = this.selected - 2;
            direction = "backward";
          }
          break;
        }
        case VI_LEFT:
        case VK_LEFT: {
          e.preventDefault();
          if (this._selected === 0) {
            this.selected = this.actions.length - 1;
          } else {
            this.selected = this._selected - 1;
            direction = "backward";
          }
          break;
        }
        case VI_RIGHT:
        case VK_RIGHT: {
          e.preventDefault();
          if (this._selected === this.actions.length - 1) {
            this.selected = 0;
          } else {
            this.selected = this._selected + 1;
            direction = "forward";
          }
          break;
        }
        case VI_DOWN:
        case VK_DOWN: {
          e.preventDefault();
          if (this._selected >= this.actions.length - 2) {
            this.selected = 0;
          } else {
            this.selected = this._selected + 2;
            direction = "forward";
          }
          break;
        }
      }
      switch(direction) {
        case "forward": {
          focus.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
          break;
        }
        case "backward": {
          focus.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
          break;
        }
      }
    }
    set selected(idx) {
      if (isFinite(this.selected)) {
        // Set the old button to tabindex -1
        let previousSelected = this.actions[this.selected];
        previousSelected.tabIndex = -1;
        previousSelected.setAttribute('aria-checked', false);
      }
      // Set the new button to tabindex 0 and focus it
      idx = parseInt(idx);
      let newSelected = this.actions[idx];
      newSelected.tabIndex = 0;
      newSelected.focus();
      newSelected.setAttribute('aria-checked', true);
      this.setAttribute('selected', idx);
      this._selected = idx;
    }
    get selected() {
      return this._selected;
    }
  }
  window.customElements.define('action-group', actionGroup);
})();

