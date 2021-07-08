# Personal Portfolio Site

_Hosted at [jaismith.dev](https://jaismith.dev) via [Netlify](https://www.netlify.com)._

[![Netlify Status](https://api.netlify.com/api/v1/badges/1f441df9-c49d-435a-9bae-79a26b8c87bd/deploy-status)](https://app.netlify.com/sites/jaismith-dev/deploys)

## Stack

Built entirely with [Next](https://nextjs.org).

Notable packages:
- [react](https://reactjs.org/)
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
