# Hostinger PHP/HTML deployment

Create an empty Custom PHP/HTML website in Hostinger. In its dashboard, open Advanced → Git and connect this repository.

- Repository: PrajaktaAdlytica/FlowBackTest-site
- Branch: hostinger-deploy
- Root/deploy directory: public_html
- Automatic deployment: enabled

The deployment branch contains the contents of dist at its root, including images, fonts, video, static page directories and .htaccess. It does not contain the source or brand kit; these remain on main.

Make edits on main. The Build for Hostinger GitHub Actions workflow installs dependencies, runs tests, builds the site and commits the output to hostinger-deploy. Hostinger then pulls that branch when automatic deployment is enabled. No Hostinger secrets or build commands are needed for this regular Git integration.

Do not edit hostinger-deploy or public_html directly: the next build replaces their generated contents. If deployment does not follow a successful GitHub build, use Hostinger's Redeploy action and inspect its Git logs.

After deployment, verify HTTPS, the intro video, mobile layout, direct links and refreshes on /product/desk/, /pricing/ and /demo/. All forms and product data remain demo-only. Keep Vercel connected until the Hostinger deployment and domain are verified.
