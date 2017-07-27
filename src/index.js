'use strict'

global.Util = require('./lib/util')

$(() => {
  // TODO DEBUG set active language to default language
  Util.lang.setActiveLanguage(Util.app.config.localization[0]).catch(console.error)
})
