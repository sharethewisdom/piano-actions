# 2D simulations of piano actions

With these interactive demos I attempt to show how different mechanisms of historical keyboard instruments work under certain conditions.

Planned UI features per action:

[ ] parameters for action regulation
[ ] speed and force as parameters for touch
[ ] variants throughout the compass
[ ] keyboard navigation
[ ] description, bibliographical references, images of technical drawings
[ ] a "skin" on the physics objects using images or SVG (Path2D?)

## usage

Go [here](https://sharethewisdom.github.io/piano-actions/), use the arrow keys to select the action you want to play with, and press enter.

Press <kbd>Space</kbd> to see it in action. (more features are added later)

## development

I recommend to use [`hub`](https://github.com/github/hub#installation). Example workflow:

```bash
git clone --recurse-submodules -j2 https://github.com/sharethewisdom/piano-actions.git
cd piano-actions
hub fork
```

Or, if you already have a remote clone:

```bash
git pull
git checkout -b solves-problem-x
# edits
git add fileA
git commit -m "Allow a and b to be set"
git add fileB fileC
git commit -m "Changed this and that in c (fixes issue #12)"
git push origin -u solves-problem-x
hub pull-request -m "$(git log -1 --pretty=%B)"
```

