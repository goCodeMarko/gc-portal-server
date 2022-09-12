const
    padayon = require('./padayon'),
    path = require('path'),
    xl = require('excel4node'),
    cloudinary = require('./../helpers/cloudinary'),
    moment = require('moment'),
    fs = require("fs");


module.exports.generate = async (set) => {
    set = await setupOptions(set);
    const wb = new xl.Workbook();                 //creates workbook
    const ws = wb.addWorksheet(set.sheetName);    //creates worksheet on the workbook
    const filename = padayon.uniqueId({ fileExtension: 'xlsx' });
    wb.createStyle(set.table.thStyle);
    wb.createStyle(set.table.tdStyle);
    console.log(set);

    const title = xl.getExcelRowCol(set.header.start);
    ws.cell(title.row, title.col).string(set.header.title);

    // for the fieldnames
    const cellStartTH = xl.getExcelRowCol(set.table.start);
    const fieldname = {
        data: set.table.fields,
        row: cellStartTH.row,
        col: cellStartTH.col
    }
    for (let i = 0; i < fieldname.data.length; i++) {
        ws.cell(fieldname.row, fieldname.col).string(fieldname.data[i]).style(set.table.thStyle);
        fieldname.col++;
    }

    // for the data
    const tabledata = {
        data: set.table.data,
        dataKeys: set.table.dataKeys,
        row: fieldname.row + 1,
        col: cellStartTH.col,
        maxCol: fieldname.data.length
    }
    console.log('tabledata', tabledata);
    for (let i = 0; i < tabledata.data.length; i++) {
        const maxLoop = tabledata.maxCol - 1;

        for (let j = 0; j <= maxLoop; j++) {
            const data = tabledata.data[i][tabledata.dataKeys[j]];

            switch (typeof data) {
                case 'number':
                    ws.cell(tabledata.row, tabledata.col).number(data).style(set.table.tdStyle);
                    break;
                default:
                    ws.cell(tabledata.row, tabledata.col).string(data).style(set.table.tdStyle);
                    break;
            }

            tabledata.col++;
        }
        tabledata.col = cellStartTH.col;
        tabledata.row++;
    }

    //Creates a copy of excel.xlsx with unique file name
    fs.copyFileSync(path.join(__dirname, '..', 'xfiles', 'base.xlsx'), path.join(__dirname, '..', 'xfiles', filename));

    //creates buffer of the work book
    const buffer = await wb.writeToBuffer();

    //Writes the buffer on the newly copied excel file
    fs.writeFileSync(path.join(__dirname, '..', 'xfiles', filename), buffer, function (err) {
        if (err) {
            throw err;
        }
    });

    const cloud = await cloudinary.uploader.upload(path.join(__dirname, '..', 'xfiles', filename), {
        folder: 'logo',
        resource_type: 'raw',
        type: "authenticated"
    });

    //Removes the newly copied file
    fs.rmSync(path.join(__dirname, '..', 'xfiles', filename));

    const details = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
        created_at: moment().format('MM-DD-YYYY_hh-mm-ss'),
        format: 'xlsx'
    }

    return details;
}


async function setupOptions(set) {
    if (!set.hasOwnProperty('sheetName') || !set.sheetName){
        set.sheetName = 'Sheet 1';  
    } 

    if (!set.hasOwnProperty('table') || !set.table) {
        set.table = {}
    } 
    if (!set.table.hasOwnProperty('start') || !set.table.start) {
        set.table.start = 'A3'
    }
    if (!set.table.hasOwnProperty('fields') || !set.table.fields) {
        set.table.fields = []
    }
    if (!set.table.hasOwnProperty('data') || !set.table.data) {
        set.table.data = []
    }
    if (!set.table.hasOwnProperty('dataKeys') || !set.table.dataKeys) {
        set.table.dataKeys = []
    }
    if (!set.table.hasOwnProperty('thStyle') || !set.table.thStyle) {
        set.table.thStyle = {
            alignment: {
                horizontal: ['center'],
            },
            font: {
                color: '#ffffff',
            },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#ff8100'
            }
        }
    }
    if (!set.table.hasOwnProperty('tdStyle') || !set.tdStyle) {
        set.table.tdStyle = {
            alignment: {
                horizontal: ['center'],
            },
            font: {
                color: '#000000',
                size: 12,
            }
        }
    }

    if (!set.hasOwnProperty('header') || !set.header) {
        set.header = {}
    } 

    if (!set.header.hasOwnProperty('start') || !set.header.start) {
        set.header.start = 'A1'
    }

    if (!set.header.hasOwnProperty('title') || !set.header.title) {
        set.header.title = ''
    }

    return set;
}
