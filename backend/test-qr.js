const fs = require('fs');

async function probarQr() {
  const response = await fetch('http://localhost:4000/api/buses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      placa: 'XYZ-999',
      numero_interno: '200',
      ruta: 'Ruta de prueba',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error:', data.mensaje);
    return;
  }

  // Quitamos el prefijo "data:image/png;base64," y dejamos solo los datos puros
  const base64Data = data.qrImage.replace('data:image/png;base64,', '');

  // Guardamos esos datos como un archivo .png real
  fs.writeFileSync('qr-generado.png', base64Data, 'base64');

  console.log('QR generado correctamente en backend/qr-generado.png');
  console.log('Codigo:', data.codigo_qr);
}

probarQr();