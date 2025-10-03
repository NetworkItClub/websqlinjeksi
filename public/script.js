// script.js - versi mengejek/taunt
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const result = document.getElementById('result');
  const tauntBtn = document.getElementById('tauntBtn');

  // koleksi ejekan singkat
  const taunts = [
    "Heh, cuma begitu doang? Coba lagi, jangan malu-malu.",
    "Weleh — masih amatir. Lebih licik dong!",
    "Kamu serius? Itu belum cukup greget.",
    "Masih kurang, kayaknya kamu belum ngetes tanda kutipnya.",
    "Jangan menyerah. Tapi serius, ini gampang banget buat yang tahu caranya.",
    "Masih belum dapet? Aku kasih waktu kamu mikir... sedikit saja.",
    "Ahah, coba yang lain deh. Teknik injection-mu masih terbaca jelas."
  ];

  // ejekan yang lebih pedas kalau gagal berkali2
  const escalation = [
    "Udah berkali-kali tapi masih belum? Kapan tamat kursusmu?",
    "Kayak nonton film yang plotnya mudah ditebak — predictable sekali.",
    "Kalau terus gini, aku mulai kasihan. Ayo, tunjukkan skill!",
    "Ini bukan soal keberuntungan. Perlu strategi, bukan nekat."
  ];

  let failCount = 0;

  function randomTaunt() {
    if (failCount >= 6) {
      // setelah banyak kegagalan, gunakan eskalasi acak
      return escalation[Math.floor(Math.random() * escalation.length)];
    }
    return taunts[Math.floor(Math.random() * taunts.length)];
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    result.textContent = 'Mengirim...';

    const fd = new FormData(form);
    const body = new URLSearchParams(fd);

    try {
      const res = await fetch(form.action, {
        method: form.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        cache: 'no-store'
      });
      const txt = await res.text();

      // tampilkan apa pun yang dikembalikan server (flag atau pesan lain)
      result.textContent = txt;

      // tentukan apakah login dianggap gagal — cari kata 'Login failed' (sesuaikan jika server berbeda)
      const lowered = txt.toLowerCase();
      if (lowered.includes('login failed') || lowered.includes('tidak ada') || lowered.includes('no flag')) {
        failCount++;
        // beri jeda kecil supaya taunt terasa dramatis
        setTimeout(() => {
          result.textContent = randomTaunt();
        }, 600);
      } else {
        // berhasil (mungkin flag) -> reset counter dan beri pesan kemenangan
        failCount = 0;
        // tambahkan sedikit ejekan ramah (merayakan kemenangan si pemain)
        setTimeout(() => {
          result.textContent = txt + "\n\nOK, kamu menang. Jangan lupa pamer ke temanmu 😏";
        }, 300);
      }
    } catch (err) {
      // kalau error jaringan
      failCount++;
      result.textContent = 'Request error: ' + err;
      setTimeout(() => {
        result.textContent = randomTaunt();
      }, 600);
    }
  });

  // tombol Taunt: memancing ejekan tanpa mengirim request
  tauntBtn.addEventListener('click', () => {
    failCount++;
    result.textContent = randomTaunt();
  });
});
