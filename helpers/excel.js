const
    padayon = require('./padayon'),
    path = require('path'),
    xl = require('excel4node'),
    cloudinary = require('./../helpers/cloudinary'),
    moment = require('moment'),
    fs = require("fs");


module.exports.generate = async (set) => {
    const option = await setupOptions(set);
    const wb = new xl.Workbook();                           //creates workbook
    const ws = wb.addWorksheet(option.sheetName);           //creates worksheet on the workbook
    const filename = padayon.uniqueId({ fileExtension: 'xlsx' });
    wb.createStyle(option.table.thStyle);
    wb.createStyle(option.table.tdStyle);

    const title = xl.getExcelRowCol(option.header.start);
    ws.cell(title.row, title.col).string(option.header.title);

    // for the fieldnames
    const cellStartTH = xl.getExcelRowCol(option.table.start);
    const fieldname = {
        data: option.table.fields,
        row: cellStartTH.row,
        col: cellStartTH.col
    }

    fieldname.data.forEach((item) => {
        ws.cell(fieldname.row, fieldname.col).string(item).style(option.table.thStyle);
        fieldname.col++;
    });

    const tabledata = {
        data: set.table.data,
        dataKeys: set.table.dataKeys,
        row: fieldname.row + 1,
        col: cellStartTH.col,
        maxCol: fieldname.data.length
    }
  
    for (let i = 0; i < tabledata.data.length; i++) {
        const maxLoop = tabledata.maxCol - 1;

        for (let j = 0; j <= maxLoop; j++) {
            const data = tabledata.data[i][tabledata.dataKeys[j]];

            switch (typeof data) {
                case 'number':
                    ws.cell(tabledata.row, tabledata.col).number(data).style(option.table.tdStyle);
                    break;
                default:
                    ws.cell(tabledata.row, tabledata.col).string(data).style(option.table.tdStyle);
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
    const option = {
        sheetName: set.sheetName || 'Sheet 1',
        header: {
            start: set.header.start || 'A1',
            title: set.header.title
        },
        table: {
            start: set.table.start || 'A4',
            fields: set.table.fields || [],
            data: set.table.data || [],
            dataKeys: set.table.dataKeys || [],
            thStyle: set.table.thStyle || {
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
            },
            tdStyle: set.table.tdStyle || {
                alignment: {
                    horizontal: ['center'],
                },
                font: {
                    color: '#000000',
                    size: 12,
                }
            }
        }
    }

    return option;
}
