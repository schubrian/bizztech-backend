const mongoose = require('mongoose');
const readLaterList = new mongoose.Schema({
    //_id: String,
    news_id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    title: String,
    url: String,
    publishedAt: String,
    urlToImage: String
})

const readLater = mongoose.model('readLater', readLaterList);
module.exports = readLater;