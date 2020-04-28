const fs = require('fs');

fs.readdir('./src/shaders', (err, items) => {
    const outputJSON = {};

    for (var i=0; i<items.length; i++) {
        outputJSON[items[i]] = fs.readFileSync(`./src/shaders/${items[i]}`, 'utf8')
    }

    fs.writeFileSync('./src/shaders.json', JSON.stringify(outputJSON));

    console.log('Shaders is building!   Output shaders.json in src folder')
})