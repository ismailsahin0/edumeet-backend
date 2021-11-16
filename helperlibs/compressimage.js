const compress_images = require("compress-images");
const { deleteFile } = require('./fileoperations');

function compress(path) {
    compress_images(
        path,
        "userimages/",
        { compress_force: false, statistic: true, autoupdate: true },
        false,
        { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
        { png: { engine: "pngcrush", command: false } },
        { svg: { engine: "svgo", command: "--multipass" } },
        {
            gif: { engine: "gif2webp", command: false },
        },
        function (err, completed) {
            if (completed === true) {
                // Doing something.
                deleteFile(path);
            }
        }
    );
}

module.exports = compress;