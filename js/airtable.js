/**
Possible todo
-Combine 3 tables of data call into one for loop
  -This is how it was done originally
-Call each table and then use foreign keys to gather data
  -benefit is there are fewer api calls
-remove foriegn keys from results object
  -not needed for end result and is just clutter at that point
*/

const airtable = require('airtable');
const csv = require('csvtojson');

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

  // Add initial records to results variable.
  for (let i = 0; i < records.length; i++){
    // Transforming blindspot name to have no spaces or '/' in the name and replacing those with underscores
    // This will be used for the url in Hugo when using list.html and all the .md files at once for the circle image 
    blindspot_name_no_space = records[i].fields['Blindspot'].replace(/ /g, "_");
    blindspot_name_url = blindspot_name_no_space.replace(/\//g, "_").toLowerCase();
    results[i] = {
      "blindspot_name" : records[i].fields['Blindspot'],
      "blindspot_name_url": blindspot_name_url,
      "partnership_phase": records[i].fields['Partnership Phase'],
      "academic_perspective" : records[i].fields['Academic Perspective'],
      "practitioner_perspective" : records[i].fields['Practitioner Perspective'],
      "convergence_opportunities" : records[i].fields['Convergence Opportunities'],
      "DGQ_ID": [],
      "DGQ": [],
      "toolkit_resources_ID": [],
      "toolkit_resources" : []
    };
    try{
      for(let j = 0; j < records[i].fields['Discussion Guide Questions'].length; j++){
        results[i].DGQ_ID[j] = records[i].fields['Discussion Guide Questions'][j];
      };
    } catch(err){
      // console.log("DGQ_ID error => ");
      // console.error(err);
    }
    try{
      for(let j = 0; j < records[i].fields['Toolkit Resources'].length; j++){
        results[i].toolkit_resources_ID[j] = records[i].fields['Toolkit Resources'][j];
      };
    } catch(err){
      // console.log("DGQ_ID error => ");
      // console.error(err);
    }
  };

  // Augment result records with additional data for Discussion Guide Questions.
  for (const result of results){
    for (const foreignKey of result.DGQ_ID) {
      const newInfo = await base('Discussion Guide Questions').find(foreignKey)
      result.DGQ.push({
        "question" : newInfo.fields['Question'],
        "perspective" : newInfo.fields['Perspective']
      });
    };
  };


  //Augment results records with addtional data for Toolkit Resources
  for (const result of results){
    for (const foreignKey of result.toolkit_resources_ID){
      const newInfo = await base('Toolkit Resources').find(foreignKey)
        result.toolkit_resources.push({
          "tool_item" : newInfo.fields['Toolkit Item'],
          "url" : newInfo.fields['URL'],
          "author_institution" : newInfo.fields['Author or Institution'],
          "blindspot_quote" : newInfo.fields['Blindspot Quote'],
          "type_resource" : newInfo.fields['Type of Resource'],
          "year" : newInfo.fields['Year'],
        });
      };
    };

  //using GitHub action to create JSON data file based on this output
  console.log(JSON.stringify(results, null, 2));

} catch (err) {
  console.error(err);
  process.exit(1)
}
})();
