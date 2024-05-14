const Papa = require('papaparse');

module.exports.generate = async (prop) => {
    const csv = Papa.unparse([
	{
	    "Column 1": 4,
	    "Column 2": 5,
	    "Column 3": 6,
	    "Column 4": 7
	}
    ],{
        step: function (results, parser) {
            console.log("Row data:", results.data);
            console.log("Row errors:", results.errors);
        }
    });
}