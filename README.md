# react-chess
A local multiplayer chess game made with TypeScript with React.

## Building
- Run `npm run build` to generate a production build of the game
- You can play it by lauching `dist/index.html` in a web browser

## Updating Build for GitHub Pages
The `gh-pages` branch contains the `dist` directory subtree, this is how it's updated:

```bash
git checkout master
npm run build
git add dist
git commit -m "Updated build"
git subtree push --prefix dist origin gh-pages
```

The `git subtree push` command does a `git subtree split` and then pushes the branch to origin.
