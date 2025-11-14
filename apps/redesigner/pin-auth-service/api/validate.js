// База данных PIN-кодов для конкретного ID приложения
// В реальном приложении это будет база данных (например, Redis, PostgreSQL).
const validPins = {
  'app1': ['061125', '251106', '123456', '789012']
};

export default function handler(req, res) {
  // 1. Обрабатываем предварительный OPTIONS-запрос от браузера (preflight request)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 часа
    return res.status(200).end();
  }

  // 2. Устанавливаем CORS-заголовки для основного запроса (POST)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 3. Основная логика валидации
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { pin, appId } = req.body;

  if (!pin || !appId) {
    return res.status(400).json({ message: 'PIN and App ID are required.' });
  }

  const appPins = validPins[appId];

  // Проверяем, существует ли массив пинов для этого appId и содержится ли в нем пин
  if (appPins && appPins.includes(pin)) {
    // В реальном приложении здесь можно было бы пометить PIN как использованный.
    return res.status(200).json({ message: 'PIN is valid.' });
  } else {
    // Если PIN не найден
    return res.status(404).json({ message: 'PIN not found or already used.' });
  }
}
