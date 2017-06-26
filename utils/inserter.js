const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const log = require('./log')
const yaml = require('js-yaml')
const merge = require('object-merge')
const properties = require('./properties')
const os = require('os')

function getAllSourceFiles(dir) {
  let src = []
  let files = fs.readdirSync(dir)
  files.forEach(file => {
    let filepath = path.join(dir, file)
    let stats = fs.statSync(filepath)
    if (stats.isDirectory()) {
      src = src.concat(getAllSourceFiles(filepath))
    } else if (
      stats.isFile() && (filepath.endsWith('.brs') || filepath.endsWith('.xml'))
    ) {
      src.push(filepath)
    }
  })
  return src
}

function getConstant(value, constants) {
  const keys = value.split('.')
  let val = ''
  let obj = constants
  keys.forEach(key => {
    if (obj && obj[key]) {
      obj = obj[key]
    } else {
      obj = null
    }
  })
  if (obj && typeof obj == 'string') {
    return obj
  } else {
    log.error(`Failed to find ${value}`)
    return
  }
}

function insertConstants(src, constants, filename) {
  const regex = /@{(.*?)}/g
  if (typeof src != 'string') {
    log.error('src is not string: %s', typeof src)
    log.pretty('error', '', src)
    return
  }
  let count = 0
  src = src.replace(regex, (match, p, offset, str) => {
    let replace = getConstant(p, constants)
    if (replace) {
      if (log.level === 'debug') {
        const lines = src.substring(0, offset).split(os.EOL)
        const last = lines[lines.length - 1]
        log.debug(
          `${p} => ${replace} at ${filename.substring(6)}:${lines.length}:${last.length}`
        )
      }
      count++
      return replace
    } else {
      const lines = src.substring(0, offset).split(os.EOL)
      const last = lines[lines.length - 1]
      log.error(
        `${p} => NOT FOUND at ${filename.substring(6)}:${lines.length}:${last.length}`
      )
      try {
        log.pretty('error', 'Printing constants object:', constants)
      } catch (e) {
        log.error(e.message)
      }
      process.exit(-1)
    }
    return getConstant(p)
  })

  if (count > 0)
    log.verbose(
      `replaced ${count} constant(s) in file: ${filename.substring(6)}`
    )
  return src
}

function compile(directory, constants) {
  let sourceFiles = getAllSourceFiles(directory)
  //log.info(sourceFiles)
  sourceFiles.forEach(file => {
    let srcData = fs.readFileSync(file)
    let src = insertConstants(srcData.toString(), constants, file)
    fs.writeFileSync(file, src)
  })
}

function mergeConstants(flavors) {
  let constants = {}
  flavors.forEach(flavor => {
    if (!properties.flavors.includes(flavor)) return
    let dir = path.join(properties.sourceDir, flavor, 'constants.yaml')
    try {
      let c = yaml.safeLoad(fs.readFileSync(dir))
      if (c) constants = merge(constants, c)
    } catch (e) {
      log.warn(`no constants found for ${flavor}`)
    }
  })
  return constants
}

module.exports = {
  compile,
  mergeConstants
}