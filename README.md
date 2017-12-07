# What is this?

This is a scraper which uses [Google's Puppeteer](https://github.com/GoogleChrome/puppeteer), a way of interacting with headless Chrome, to scrape [Tripod](tripod.brynmawr.edu) (the library system for Swarthmore, Haverford, and Bryn Mawr) and automatically renew books before they become overdue. 

Previously, a version of this used [PhantomJS](http://phantomjs.org/) but, now that it is [discontinued :frowning:](https://groups.google.com/forum/#!topic/phantomjs/9aI5d-LDuNE), I transitioned to using headless Chrome.

# How do I use this?

Copy `creds.js.example` with the appropriate information and use cron to run `Tripod_Cron.sh` as often as you'd like
