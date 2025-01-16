const fs = require('fs');
const path = require('path');
const { parseStringPromise, Builder } = require('xml2js');
const yargs = require('yargs');
const argv = yargs.option('input', {
    alias: 'i',
    description: 'The input file to watch',
    type: 'string',
    demandOption: true
}).option('output', {
    alias: 'o',
    description: 'The output file to write sorted data',
    type: 'string',
    demandOption: true
}).argv;


const inputFile = argv.input;
const outputFile = argv.output;

let timer;

// Function to sort rows
const sortRows = (rows) => {
    return rows.sort((a, b) => {
        const getSortKey = (row) => {
            const lastName = row.last_name?.[0] || '';
            const firstName = row.First_Name?.[0] || '';
            const name = row.name?.[0] || '';

            return lastName || firstName || name;
        };

        const keyA = getSortKey(a).toLowerCase();
        const keyB = getSortKey(b).toLowerCase();

        return keyA.localeCompare(keyB);
    });
};

// Watch for changes in the input file
fs.watchFile(inputFile, () => {
    console.log('File change detected. Starting timer...');

    if (timer) {
        clearTimeout(timer);
    }

    timer = setTimeout(async () => {
        console.log('Timer expired. Processing...');

        try {
            // Read the XML file
            const xmlData = fs.readFileSync(inputFile, 'utf-8');
            const parsedXml = await parseStringPromise(xmlData);

            // Filter and reorder <row> elements
            let rows = parsedXml.root.row || [];
            rows = rows.filter(row => 
                (typeof row.First_Name?.[0] === "string" && row.First_Name[0].trim()) ||
                (typeof row.last_name?.[0] === "string" && row.last_name[0].trim()) ||
                (typeof row.name?.[0] === "string" && row.name[0].trim())
              )
            const sortedRows = sortRows(rows);
            parsedXml.root.row = sortedRows;

            // Convert JSON back to XML
            const builder = new Builder();
            const sortedXml = builder.buildObject(parsedXml);

            // Write the sorted XML to the output file
            fs.writeFileSync(outputFile, sortedXml);
            console.log(`Sorted data written to ${outputFile}`);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }, 500); //500ms. Change this value to adjust the delay before processing the file
});

console.log(`Watching for changes to ${inputFile}...`);
