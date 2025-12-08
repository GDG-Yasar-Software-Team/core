const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


let subscribers = [
  'test@mail.com',
  'ahmet@example.com',
  'mehmet@gmail.com'
];


app.get('/', (req, res) => {
  const email = req.query.email || 'example@mail.com';
  res.redirect(`/unsubscribe.html?email=${encodeURIComponent(email)}`);
});

// Abonelikten çıkma API'si
app.post('/api/unsubscribe', (req, res) => {
  const { email, reason } = req.body;

  console.log(`Abonelikten çıkma isteği: ${email}, Sebep: ${reason || 'Belirtilmedi'}`);

  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email adresi gerekli'
    });
  }

  
  const index = subscribers.indexOf(email);
  if (index > -1) {
    subscribers.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Abonelik başarıyla sonlandırıldı'
    });
  } else {
    return res.status(404).json({
      success: false,
      message: 'Bu email adresi sistemde bulunamadı'
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📧 Test için: http://localhost:${PORT}/unsubscribe.html?email=test@mail.com`);
});