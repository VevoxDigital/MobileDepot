'use strict'

exports.localeCache = new Map()

exports.activeLanguage = undefined

/**
  * @function
  *
  * Gets a list of all language available
  * @return {Array<string>} The list of langs
  */
exports.getEnabledLanguages = () => {
  return Util.app.config.localization
}

/**
  * @function
  *
  * Parses the given language into a key-val map
  * @param {string} file The file to parse
  * @return {Map<string, string>} The map of locale keys
  */
exports.parseLanguageFile = file => {
  const lines = file.split(/\n/g)
  const locale = new Map()

  const linePattern = /^([a-z.]+)\s+(.+)$/

  for (const line of lines) {
    const data = linePattern.exec(line)
    if (!data) continue
    locale.set(data[1], data[2])
  }

  return locale
}

/**
  * @function
  *
  * Gets the language file contents from the given name
  * @param {string} name The name
  * @return {Promise<Map<string, string>>} The data from the file, or any errors during fetch.
  */
exports.getLanguageFile = name => {
  if (exports.localeCache.get(name)) return Promise.resolve(exports.localeCache.get(name))
  return new Promise((resolve, reject) => {
    $.get(`/asset/lang/${name}.lang`, data => {
      data = exports.parseLanguageFile(data)
      exports.localeCache.set(name, data)
      resolve(data)
    }).fail(err => {
      reject(err)
    })
  })
}

/**
  * @function
  *
  * Sets the current active language and causes a DOM update to
  * all locale nodes. New nodes will use the active language.
  * @param {string} lang The language name to set to.
  * @return {Promise<Map<string, string>>} The now active language
  */
exports.setActiveLanguage = (lang = Util.app.config.localization[0]) => {
  exports.activeLanguage = lang
  return exports.getLanguageFile(lang).then(() => exports.updateDOMLocale())
}

/**
  * @function
  *
  * Triggers an update of the contents of the given node (if specified) or the whole DOM.
  * @param {node} [node] The node to update.
  */
exports.updateDOMLocale = node => {
  if (node) {
    const key = node.attr('data-locale')
    if (typeof key !== 'string') return

    return exports.getLanguageFile(node.attr('data-locale-lang') || exports.activeLanguage || Util.app.config.localization[0]).then(lang => {
      return lang.get(key) ? lang : exports.getLanguageFile(Util.app.config.localization[0])
    }).then(lang => {
      node.text(lang.get(key) || key)
    }).catch(console.error)
  } else {
    $('[data-locale]').each(function () {
      exports.updateDOMLocale($(this))
    })
  }
}
