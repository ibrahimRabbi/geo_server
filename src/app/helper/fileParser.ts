import multer from "multer"


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/src/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
   
})

export const placeFile = multer({limits: { fileSize: 50 * 1024 * 1024 }, storage: storage})