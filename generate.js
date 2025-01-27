var fs = require('fs');
var path = require('path');
var { exec } = require('child_process');

// Function to parse arguments
function parseArgs(args) {
    let parsedPages = [];
    let mainPage = { title: '', domain: '' };  // Data for the main page
    let currentPage = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-pt' && args[i + 1]) {
            // Handle -pt (pageTitle for the main page)
            mainPage.title = args[i + 1];
            i++; // Skip the next argument
        } else if (args[i] === '-pd' && args[i + 1]) {
            // Handle -pd (plausibleDomain for the main page)
            mainPage.domain = args[i + 1];
            i++; // Skip the next argument
        } else if (args[i].endsWith('.md')) {
            // If a .md file is encountered, it's a new page
            if (currentPage.file) {
                parsedPages.push(currentPage); // Add the previous page if it exists
            }
            currentPage = { file: args[i], title: '', domain: '' }; // New page
        } else if (args[i] === '-t' && args[i + 1]) {
            // Handle -t (title for the page)
            currentPage.title = args[i + 1];
            i++; // Skip the next argument
        } else if (args[i] === '-d' && args[i + 1]) {
            // Handle -d (domain for the page)
            currentPage.domain = args[i + 1];
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
    // Create the command to convert index.md with the provided pageTitle and plausibleDomain
    let indexCommand = `node convert.js "${mainPage.title || 'Documentation Title'}" "${mainPage.domain || ''}" "index.md"`;
    exec(indexCommand, (err, stdout, stderr) => {
        if (err) {
            console.error('Error converting index.md:', stderr);
        } else {
            console.log(stdout);
        }
    });

    // For other Markdown files
    pages.forEach(page => {
        let { title, domain, file } = page;

        // Form the command to run convert.js with arguments for each page
        let command = `node convert.js "${title || path.basename(file, '.md')}" "${domain || ''}" "${file}"`;

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

if (pages.length > 0 || mainPage.title || mainPage.domain) {
    // Generate index.md and convert files
    generateIndexMarkdown(mainPage, pages);  // Pass mainPage and pages as separate parameters
    convertMarkdownFiles(mainPage, pages);
} else {
    console.log("At least one .md file must be provided.");
}
