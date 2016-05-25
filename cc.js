"use strict";

const fs = require('fs');
const path = require('path');
const humps = require('humps');


const args = process.argv.slice(2);
const componentName = args[0];
const componentNameCamelized = humps.camelize(componentName);
const pwd = process.env.PWD;

const JS_TEMPLATE = `// @flow \n
import './index.css';\n
type _${componentNameCamelized} = {\n  className: string\n};\n
export default ({className=''} : _${componentNameCamelized}) => (\n)`;
const CSS_NAME = componentName.charAt(0).toLowerCase() + componentName.slice(1);
const CSS_TEMPLATE = `/* @define ${CSS_NAME} */\n
.${CSS_NAME} {\n}`;


mkdir(`${pwd}/${componentName}`);

try {
    fs.lstatSync(`${pwd}/index.js`);

    let parentComponentName = pwd.split('/').pop();

    console.log(`found component ${parentComponentName}, adding imports`);

    let parentComponent = fs.readFileSync('index.js').toString();
    let importPos = parentComponent.lastIndexOf('import');
    let insertPos = parentComponent.indexOf('\n', importPos) + 1;
    let parentComponentHalfFirst = parentComponent.substring(0, insertPos);
    let parentComponentHalfSecond = parentComponent.substring(insertPos);

    let newParentFile = `${parentComponentHalfFirst}import ${componentNameCamelized.charAt(0).toUpperCase() + componentNameCamelized.slice(1)} from './${componentName}';\n${parentComponentHalfSecond}`;
    fs.writeFileSync('index.js', newParentFile);
} catch (err) {
    if(err.code != 'ENOENT') {
        console.log(err);
        process.abort();
    }
}

try {
    process.chdir(componentName);

    fs.writeFileSync('index.js', JS_TEMPLATE);
    fs.writeFileSync('index.css', CSS_TEMPLATE);
} catch (err) {
    if(err) {
        console.log(err);
        process.abort();
    }
}


function mkdir (name) {
    try {
        fs.mkdirSync(name);
    } catch (e) {
        if (e) console.error(e);
        process.abort()
    }
}






