pkgname=yttrium-weather
pkgver=0.1.4
pkgrel=1
pkgdesc='Minimal weather web app with optional device location and seven-day forecasts'
arch=('any')
url='https://github.com/TTVIKK2527/Yttrium-Weather'
license=('custom')
depends=('python' 'python-gobject' 'webkit2gtk-4.1')
source=(
  'index.html'
  'style.css'
  'app.js'
  'yttrium-weather'
  'yttrium-weather.desktop'
)
sha256sums=(
  'b476d91d2e17c83bc121669c8aa666848dd79fcfaa9e5e0db59edb801d5c059e'
  'ec64c8145e313f0351d23356c3ad8b50265a8e762624f4955ff02b5ddf35eb35'
  '243f5b9ed8ab414526ee478ff4741b3c4fee74b053b12fc23b1502fe5ecfb867'
  '1751dae95e406b467ae88b6042d6915f3aa898711f6cfcc46bce606cd918bfb2'
  '56e4b9094d041893ffb1a40f61be842397b5d09e241c4f5a64bdbca2522694a2'
)

package() {
  install -d "$pkgdir/usr/share/yttrium-weather"
  install -Dm644 index.html "$pkgdir/usr/share/yttrium-weather/index.html"
  install -Dm644 style.css "$pkgdir/usr/share/yttrium-weather/style.css"
  install -Dm644 app.js "$pkgdir/usr/share/yttrium-weather/app.js"

  install -Dm755 yttrium-weather "$pkgdir/usr/bin/yttrium-weather"
  install -Dm644 yttrium-weather.desktop "$pkgdir/usr/share/applications/yttrium-weather.desktop"
}
