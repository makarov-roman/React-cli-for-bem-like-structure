#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const humps = require('humps')


const args = process.argv.slice(2)
let componentName
let isClass
if (args[0] === 'class') {
  componentName = args[1]
  isClass = true
} else {
  componentName = args[0]
  isClass = false
}

const componentNameCamelized = humps.camelize(componentName)
const componentCssName = humps.decamelize(componentName, {separator : '-'})
const componentClassName = componentNameCamelized.charAt(0).toUpperCase() + componentNameCamelized.slice(1)
const componentFile = componentName + '.js'

const pwd = process.env.PWD

const EOL = require('os').EOL


const div = '<div></div>'
const js_expressions_func = []
const js_expressions_class = []
js_expressions_func
  .push(
    `import React from 'react'`,
    `import { observer } from 'mobx-react'${EOL}`,
    `import './${componentName}.css'${EOL}`,
    `type _${componentNameCamelized} = {}${EOL}`,
    `const ${componentClassName} = ({} : _${componentNameCamelized}) => (`,
    `  ${div}`,
    `)${EOL}`,
    `export default observer(${componentClassName})`
  )
js_expressions_class
  .push(
    `import React from 'react'`,
    `import { observer } from 'mobx-react'${EOL}`,
    `import './${componentName}.css'${EOL}`,
    `type _${componentNameCamelized} = {}${EOL}`,
    `@observer`,
    `class ${componentClassName} extends React.Component {`,
    `  props: _${componentNameCamelized}${EOL}`,
    `  render() {`,
    `    return ${div}`,
    `  }`,
    `}${EOL}`,
    `export default ${componentClassName}`
  )
const JS_TEMPLATE = isClass ? js_expressions_class.join(EOL) : js_expressions_func.join(EOL)

const CSS_NAME = componentCssName.charAt(0).toLowerCase() + componentCssName.slice(1);
const CSS_TEMPLATE = `/* @define ${CSS_NAME} */${EOL}
.${CSS_NAME} {${EOL}}`
const PACKAGE_JSON = JSON.stringify({
  private: true,
  name: componentName,
  version: '0.0.1',
  main: componentFile
})


mkdir(`${pwd}/${componentName}`)

try {
  let parentComponentName = pwd.split('/').pop()
  fs.lstatSync(`${pwd}/${parentComponentName}.js`)

  console.log(`found component ${parentComponentName}, adding imports`)

  let parentComponent = fs.readFileSync(parentComponentName + '.js').toString()
  let importPos = parentComponent.lastIndexOf('import')
  let insertPos = parentComponent.indexOf(EOL, importPos) + 1
  let parentComponentHalfFirst = parentComponent.substring(0, insertPos)
  let parentComponentHalfSecond = parentComponent.substring(insertPos)

  let newParentFile = `${parentComponentHalfFirst}import ${componentClassName} from './${componentName}'${EOL}${parentComponentHalfSecond}`
  fs.writeFileSync(parentComponentName + '.js', newParentFile)
} catch (err) {
  if (err.code != 'ENOENT') {
    console.log(err)
    process.abort()
  }
}

try {
  process.chdir(componentName)

  fs.writeFileSync(componentFile, JS_TEMPLATE)
  fs.writeFileSync(componentName + '.css', CSS_TEMPLATE)
  fs.writeFileSync('package.json', PACKAGE_JSON)
} catch (err) {
  if (err) {
    console.log(err)
    process.abort()
  }
}


function mkdir(name) {
  try {
    fs.mkdirSync(name)
  } catch (e) {
    if (e) console.error(e)
    process.abort()
  }
}
