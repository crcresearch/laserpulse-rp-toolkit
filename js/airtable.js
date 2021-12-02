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
    const records = await base('Blindspots').select({
      // cellFormat: 'string',
      timeZone: 'America/Indiana/Indianapolis',
      userLocale: 'en',
      view: 'Grid view',
    }).all();

    const results = [];
    for (let i = 0; i < records.length; i++){
      results[i] = {
        "blindspot_name" : records[i].fields['Blindspot'],
        "academic_perspective" : records[i].fields['Academic Perspective'],
        "practitioner_perspective" : records[i].fields['Practitioner Perspective'],
        "convergence_opportunities" : records[i].fields['Convergence Opportunities'],
        "DGQ" : [],
        "toolkit_resources" : []
      };
      try {
        for (let j = 0; j < records[i].fields['Discussion Guide Questions'].length; j++) {
          DGQ_ID = records[i].fields['Discussion Guide Questions'][j];
          base('Discussion Guide Questions').find(DGQ_ID, function(err, dgq_record) {
            if (err) { console.error(err); return; }
            results[i].DGQ[j] = {
              "question" : dgq_record.fields['Question'],
              "perspective" : dgq_record.fields['Perspective']
            };
          });
        };
      } catch(err){
        // console.log("DGQ error => ");
        // console.error(err);
      }
      try {
        for (let k = 0; k < records[i].fields['Toolkit Resources'].length; k++) {
          TR_ID = records[i].fields['Toolkit Resources'][k];
          base('Discussion Guide Questions').find(TR_ID, function(err, tr_record) {
            if (err) { console.error(err); return; }
            results[i].toolkit_resources[k] = {
              "tool_item" : tr_record.fields['Toolkit Item'],
              "url" : tr_record.fields['URL'],
              "author_institution" : tr_record.fields['Author or Institution'],
              "blindspot_quote" : tr_record.fields['Blindspot Quote'],
              "type_resource" : tr_record.fields['Type of Resource'],
              "year" : tr_record.fields['Year']
            };
        });
        };
      }catch(err){
        // console.log("toolkit resource error => ");
        // console.error(err);
      }
    };
    setTimeout(function(){
    console.log(JSON.stringify(results, null, 2));
    }, 45000);
  } catch (err) {
    console.error(err);
    process.exit(1)
  }
})();
