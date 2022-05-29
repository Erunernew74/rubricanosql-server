const mongoose = require('mongoose');

const numeriSchema = new mongoose.Schema({
    tipologia: {
        type: String,
        required: true
    },
    numeroTelefono: {
        type: String,
        required: true
    },
    proprietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'indirizzi'
    }
})

const NumeriTelefono = mongoose.model('numeri', numeriSchema);
module.exports = NumeriTelefono;