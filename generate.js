var fs = require('fs');
var path = require('path');
var { exec } = require('child_process');

// Function to parse arguments
function parseArgs(args) {
    let parsedPages = [];
    let mainPage = { title: '', trackingScript: '' };  // Data for the main page
    let currentPage = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-mt' && args[i + 1]) {
            // Handle -pt (pageTitle for the main page)
            mainPage.title = args[i + 1];
            i++; // Skip the next argument
        } else if (args[i] === '-mts' && args[i + 1]) {
            // Handle -mts (tracking script for the main page)
            mainPage.trackingScript = args[i + 1];
            i++; // Skip the next argument
        }
        else if (args[i].endsWith('.md')) {
            // If a .md file is encountered, it's a new page
            if (currentPage.file) {
                parsedPages.push(currentPage); // Add the previous page if it exists
            }
            currentPage = { file: args[i], title: '', trackingScript: mainPage.trackingScript }; // New page
        } else if (args[i] === '-t' && args[i + 1]) {
            // Handle -t (title for the page)
            currentPage.title = args[i + 1];
            i++; // Skip the next argument
        } else if (args[i] === '-ts' && args[i + 1]) {
            // Handle -ts (tracking script for the page)
            currentPage.trackingScript = args[i + 1];
            i++; // Skip the next argument
        }
    }

    if (currentPage.file) {
        parsedPages.push(currentPage); // Add the last page if it exists
    }

    return { mainPage, pages: parsedPages };
}

// Function to generate index.md
function generateIndexMarkdown(mainPage, pages) {
    let links = pages.map(page => {
        let fileNameWithoutExt = path.basename(page.file, '.md');
        return `- [${page.title || fileNameWithoutExt}](${fileNameWithoutExt}.html)`;
    }).join("\n");

    let indexMd = `
# ${mainPage.title || "My Documentation"}

## Pages:
${links}
  `;

    try {
        fs.writeFileSync('index.md', indexMd);
        console.log('index.md has been created!');
    } catch (err) {
        console.error('Error writing file "index.md":', err);
    }
}

// Function to convert all Markdown files using exec
function convertMarkdownFiles(mainPage, pages) {
    // Create the command to convert index.md with the provided pageTitle and trackingScript
    let indexCommand = `node convert.js "${mainPage.title || 'Documentation Title'}" "${mainPage.trackingScript || ''}" "index.md"`;
    exec(indexCommand, (err, stdout, stderr) => {
        if (err) {
            console.error('Error converting index.md:', stderr);
        } else {
            console.log(stdout);
        }
    });

    // For other Markdown files
    pages.forEach(page => {
        let { title, trackingScript, file } = page;

        // Form the command to run convert.js with arguments for each page
        let command = `node convert.js "${title || path.basename(file, '.md')}" "${trackingScript || ''}" "${file}"`;

        // Execute the command
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error converting file ${file}:`, stderr);
            } else {
                console.log(stdout);
            }
        });
    });
}

// Main process
let args = process.argv.slice(2);  // Get the arguments
let { mainPage, pages } = parseArgs(args); // Parse the arguments

if (pages.length > 0 || mainPage.title || mainPage.trackingScript) {
    // Generate index.md and convert files
    generateIndexMarkdown(mainPage, pages);  // Pass mainPage and pages as separate parameters
    convertMarkdownFiles(mainPage, pages);
} else {
    console.log("At least one .md file must be provided.");
}
