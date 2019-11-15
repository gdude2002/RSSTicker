# RSSTicker

This is a project that I wrote to scroll a list of entries from an RSS feed,
designed exclusively for use at my workplace.

I've just uploaded it here for the sake of ease of distribution for myself,
and it may someday help someone figure out the same stuff I had to.

# Usage

Install the environment using Pipenv, and then you can run this as you might
run any other Flask app. This one is designed to be used in very low-traffic
environments, so the below method of running it only uses the development 
server.

If you're in a higher-traffic environment or your ticker is available on the
public internet, please use a real WSGI server like `gunicorn` instead.

1. Create a file named `.env` in the cloned repo directory, and add the 
   following text to it:

   ```dotenv
   FLASK_APP="ticker.app:app"
   FEED_URL=Insert your feed URL here
   
   TAG_DEFAULT=is-dark
   ```

2. Install Pipenv dependencies and start the server:

   ```bash
   pipenv sync
   pipenv run flask run
   ```

# Configuration

This application is entirely configured using environment variables, and 
includes a simple way to colour the tag shown on each item in the ticker.

* `FLASK_APP` - Required by `flask_run`, this should point to the Flask app.
* `FEED_URL` - The URL (or path to local file) to the RSS/Atom feed to parse.
* `TAG_DEFAULT` - The CSS class to apply to all non-matched tags by default.

Only a single tag is shown on each post. In order to change the colour of the
tag, you can create an environment variable of the form `TAG_TAGNAME`, where
`TAGNAME` is the name of your tag as given in the RSS feed. This should be
entirely upper-case, and spaces may be replaced with underscores ( `_` ). The
value should be the CSS class to apply - As this project uses Bulma, the
colours available are documented in the Bulma docs, 
[here](https://bulma.io/documentation/elements/tag/#colors).

Tags are matched in the order they're found in the feed. The first tag to be
matched to a configured CSS class (as explained above) is the tag that will be
displayed on the entry. If no tags are matched, then the **last** tag found
in the feed entry is used, with the `TAG_DEFAULT` colour specified above.

---

# Customisation

If you'd like to customise this app further than it allows for, please feel free
to create a fork and use it for your own purposes - as far as the license allows. 
