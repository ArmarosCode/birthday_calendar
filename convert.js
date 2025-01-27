var showdown = require('showdown');
var fs = require('fs');
var hljs = require('highlight.js');

// Get the filename, page title, and plausible domain from command-line arguments
let filename = process.argv[4] || "README.md";  // Default to "README.md" if not provided
let pageTitle = process.argv[2] || "";  // Page title from arguments (default is empty)
let plausibleDomain = process.argv[3] || "";  // Plausible domain from arguments (default is empty)

// Create a custom extension for syntax highlighting in showdown
showdown.extension('highlight', function () {
  // Function to unencode HTML entities
  function htmlunencode(text) {
    return (
      text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    );
  }

  return [{
    type: "output",
    filter: function (text, converter, options) {
      var left = "<pre><code\\b[^>]*>",
        right = "</code></pre>",
        flags = "g";

      var replacement = function (wholeMatch, match, left, right) {
        match = htmlunencode(match);  // Decode HTML entities in the code block
        var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];  // Extract language class for syntax highlighting
        left = left.slice(0, 18) + 'hljs ' + left.slice(18);  // Add 'hljs' class for highlight.js

        // If a language is provided and supported by highlight.js, highlight accordingly
        if (lang && hljs.getLanguage(lang)) {
          return left + hljs.highlight(match, { language: lang }).value + right;
        } else {
          return left + hljs.highlightAuto(match).value + right;  // Auto-detect language for highlighting
        }
      };

      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);  // Replace code blocks with highlighted code
    }
  }];
});

// Read style.css and syntax highlighting styles from external files
fs.readFile(__dirname + '/style.css', function (err, styleData) {
  fs.readFile(__dirname + '/node_modules/highlight.js/styles/atom-one-dark.css', function (err, highlightingStyles) {
    fs.readFile(process.cwd() + '/' + filename, function (err, data) {
      if (err) throw err;  // Handle file read error

      let text = data.toString();  // Convert Markdown file to string

      // Initialize showdown converter with various options
      let converter = new showdown.Converter({
        ghCompatibleHeaderId: true,  // Allow GitHub-style header IDs
        simpleLineBreaks: true,  // Enable simple line breaks in Markdown
        ghMentions: true,  // Enable GitHub-style mentions
        extensions: ['highlight'],  // Use the 'highlight' extension for syntax highlighting
        tables: true  // Enable support for tables in Markdown
      });

      // HTML structure for the page, including meta tags and scripts
      var preContent = `
      <html>
        <head>
          <title>` + pageTitle + `</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta charset="UTF-8">`

      if (plausibleDomain.length > 0) {
        // Add Plausible Analytics script if a domain is provided
        preContent += `
          <script defer data-domain="` + plausibleDomain + `" src="https://plausible.io/js/script.js"></script>
        `
      }

      preContent += `
        </head>
        <body>
          <div id='content'>`;

      // Closing HTML structure
      let postContent = `
          </div>
          <style type='text/css'>` + styleData + `</style>
          <style type='text/css'>` + highlightingStyles + `</style>
        </body>
      </html>`;

      // Convert the Markdown text into HTML using showdown
      html = preContent + converter.makeHtml(text) + postContent;
      converter.setFlavor('github');  // Set GitHub-style flavor for Markdown

      // Define the output HTML file name and path
      let outputFile = filename.replace(".md", ".html");
      let filePath = process.cwd() + "/" + outputFile;

      // Write the generated HTML to a new file
      fs.writeFile(filePath, html, { flag: "wx" }, function (err) {
        if (err) {
          console.log("File '" + filePath + "' already exists. Aborted!");  // Handle file already exists error
        } else {
          console.log("Done, saved to " + filePath);  // Log success
        }
      });
    });
  });
});
