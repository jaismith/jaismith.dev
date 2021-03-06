# Personal Portfolio Site

_Hosted at [jaismith.dev](https://jaismith.dev) via [Github Pages](https://pages.github.com/)._

**Note**: Github Pages is not properly configured to host single page web apps by default, so a workaround is employed in this project (see [here](https://github.com/rafrex/spa-github-pages)).

## Stack

Built entirely in [React](https://reactjs.org/).

Notable packages:
- [axios](https://www.npmjs.com/package/axios)
- [cheerio](https://www.npmjs.com/package/cheerio)
- [node-sass](https://www.npmjs.com/package/node-sass)
- [redux](https://www.npmjs.com/package/redux)
- [react-redux](https://www.npmjs.com/package/react-redux)
- [react-markdown](https://www.npmjs.com/package/react-markdown)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [react-social-icons](https://www.npmjs.com/package/react-social-icons)
- [recharts](https://www.npmjs.com/package/recharts)

## Features

### Github Activity

Github activity is pulled directly from the github profile page via `axios`, parsed by `cheerio`, and displayed in a `recharts` chart.

### Projects & Resume

Projects and Resume data are loaded from js objects in `App` and rendered dynamically.
