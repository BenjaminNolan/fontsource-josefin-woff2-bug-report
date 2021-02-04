const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');

const resultsDir = path.join(
  __dirname,
  'results',
);

const previewImageHeight = 100;

if (!fs.existsSync('./fontsource')) {
  console.error('Symlink ./fontsource to your locally checked-out fontsource repo');
  process.exit(1);
}

['alegreya', 'josefin-sans'].forEach((fontName) => {
  ['400', '700'].forEach((fontWeight) => {
    ['italic', 'normal'].forEach((fontStyle) => {
      ['woff', 'woff2'].forEach((fontType) => {
        const fontFile = `${fontName}-latin-${fontWeight}-${fontStyle}.${fontType}`;

        const font = fontkit.openSync(`./fontsource/packages/${fontName}/files/${fontFile}`);
        const run = font.layout(fontFile);

        let height = 0;
        let width = 0;

        const svgPaths = run.glyphs.map((g, i) => {
          const output = '<g transform="translate(' + width + ',0)"><path d="' + g.path.toSVG() + '"/></g>';
          width += run.positions[i].xAdvance; // increases the overall canvas width letter by letter.

          if (g._metrics.advanceHeight > height) {
            height = g._metrics.advanceHeight;
          }

          return output;
        });

        const aspectRatio = width / height;

        fs.writeFileSync(
          path.join(
            resultsDir,
            `${fontName}-latin-${fontWeight}-${fontStyle}-${fontType}.svg`,
          ),
          `<svg xmlns="http://www.w3.org/2000/svg" width="${(aspectRatio * previewImageHeight) + 40}" height="${previewImageHeight * 1.2}" viewBox="0 0 ${width + 40} ${height * 1.2}"><g transform="translate(20,${height * .8}) scale(1,-1)">${svgPaths.join('')}</g></svg>`,
        );
      });
    });
  });
});
