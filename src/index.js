'use strict'

global.Util = require('./lib/util')

$(() => {
  const lang = window.localStorage.getItem('language')
  Util.lang.activeLanguage = lang
  Util.lang.updateDOMLocale()

  if (lang) hideLanguageOverlay(lang)
  else {
    const c = $('#sectionLanguageSelect > .section-container')
    c.show()
    c.find('button').click(function () {
      hideLanguageOverlay($(this).attr('data-locale-lang'))
      window.localStorage.setItem('language', $(this).attr('data-locale-lang'))
    })
  }
})

function hideLanguageOverlay (lang) {
  console.log('hiding with ' + lang)
  Util.lang.setActiveLanguage(lang).then(() => {
    $('#sectionLanguageSelect').velocity({ opacity: 0 }, {
      duration: 300,
      complete: () => {
        $('#sectionLanguageSelect').hide()
      }
    })
  }).catch(console.error)
}
