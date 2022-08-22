const airtable = require('airtable');

let fs = require("fs");
let { render } = require("mustache");

/**
 * Fetches data from Airtable, serializes it to JSON and outputs it to stdout.
 * Requires the AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables to be set.
 */

 (async function(){
    try {
      if (!process.env.AIRTABLE_BASE_ID) {
        throw new Error('A valid base ID is required to connect to Airtable. The AIRTABLE_BASE_ID environment variable is not set.');
      }
      const base = airtable.base(process.env.AIRTABLE_BASE_ID);
      const results = [];
      
    
    
      const records = await base("Blindspots")
        .select({
          timeZone: "America/Indiana/Indianapolis",
          userLocale: "en",
          view: "Grid view",
        })
        .all();

        //creating object that hold blindspot name and an index
        for (let i = 0; i < records.length; i++){
            blindspot_space = records[i].fields['Blindspot'].replace(/ /g, "_");
            blindspot = blindspot_space.replace(/\//g, "_");
            results[i] = {
                "blindspot_name" : blindspot,
                "blindspot_title" : records[i].fields['Blindspot'],
                "index" : i
            };
        };

        let template = fs.readFileSync("./static/images/template.md").toString();

        fs.rmSync('./content/challenges/', {recursive: true});
        fs.mkdir('./content/challenges/',function(err) {
          if (err) {
             return console.error(err);
          }
          // console.log("Directory created successfully!");
       });

        // let output = render(template, results[5]);
        // console.log('output => ', output);
        // fs.writeFileSync('./content/challenges/test3.md', output);

        for (const result of results){
            let output = render(template, result);
            fs.writeFileSync(`./content/challenges/${result.blindspot_name}.md`, output);
        };

    } catch (err) {
        console.error(err);
        process.exit(1)
    }
    })();