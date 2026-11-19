import type { QuizQuestion } from '../types/game';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // =========================================================
  // TINGKAT KESULITAN: MUDAH (20 SOAL: ID 1 - 20)
  // =========================================================
  {
    id: 1,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Berapakah jumlah baris dalam satu bait pantun pada umumnya?',
    pilihan: ['2 baris', '4 baris', '6 baris', '8 baris'],
    jawabanIndex: 1,
    pembahasan: 'Pantun merupakan puisi lama yang umumnya terdiri atas 4 baris dalam setiap baitnya.'
  },
  {
    id: 2,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Pola rima (persajakan) akhir yang tepat untuk sebuah pantun adalah ....',
    pilihan: ['a-a-a-a', 'a-a-b-b', 'a-b-a-b', 'a-b-b-a'],
    jawabanIndex: 2,
    pembahasan: 'Pantun bersajak silang dengan pola rima akhir a-b-a-b.'
  },
  {
    id: 3,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Pada pantun, baris pertama dan kedua disebut sebagai ....',
    pilihan: ['Isi', 'Sampiran', 'Bait', 'Amanat'],
    jawabanIndex: 1,
    pembahasan: 'Baris 1 dan 2 pada pantun berfungsi sebagai sampiran (pengantar rima), sedangkan baris 3 dan 4 adalah isi.'
  },
  {
    id: 4,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Bagian inti atau pesan utama dari sebuah pantun terletak pada ....',
    pilihan: [
      'Baris ke-1 dan ke-2',
      'Baris ke-2 dan ke-3',
      'Baris ke-3 dan ke-4',
      'Baris ke-1 dan ke-4'
    ],
    jawabanIndex: 2,
    pembahasan: 'Pesan atau maksud utama pantun terdapat pada baris ke-3 dan ke-4 yang disebut bagian isi.'
  },
  {
    id: 5,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Jumlah suku kata ideal pada setiap baris pantun berkisar antara ....',
    pilihan: [
      '4 hingga 6 suku kata',
      '8 hingga 12 suku kata',
      '14 hingga 18 suku kata',
      '20 hingga 24 suku kata'
    ],
    jawabanIndex: 1,
    pembahasan: 'Setiap baris pantun umumnya terdiri atas 8 sampai 12 suku kata agar ritmenya terdengar seimbang.'
  },
  {
    id: 6,
    materi: 'Syair',
    kesulitan: 'Mudah',
    pertanyaan: 'Pola rima akhir yang menjadi ciri khas utama syair adalah ....',
    pilihan: ['a-b-a-b', 'a-a-b-b', 'a-a-a-a', 'a-b-c-d'],
    jawabanIndex: 2,
    pembahasan: 'Syair selalu bersajak rata atau sama pada keempat barisnya, yaitu berpola a-a-a-a.'
  },
  {
    id: 7,
    materi: 'Syair',
    kesulitan: 'Mudah',
    pertanyaan: 'Apakah syair memiliki sampiran seperti halnya pantun?',
    pilihan: [
      'Ya, pada baris pertama dan kedua',
      'Ya, pada baris terakhir saja',
      'Tidak, semua baris syair adalah isi',
      'Tidak, semua baris syair adalah sampiran'
    ],
    jawabanIndex: 2,
    pembahasan: 'Berbeda dengan pantun, seluruh baris (baris 1–4) dalam bait syair merupakan isi yang saling berkaitan.'
  },
  {
    id: 8,
    materi: 'Syair',
    kesulitan: 'Mudah',
    pertanyaan: 'Dari bahasa manakah istilah "syair" berasal?',
    pilihan: ['Bahasa Sanskerta', 'Bahasa Arab', 'Bahasa Jawa Kuno', 'Bahasa Portugis'],
    jawabanIndex: 1,
    pembahasan: 'Kata syair berasal dari bahasa Arab "syu\'ur" atau "syi\'ir" yang berarti perasaan atau puisi.'
  },
  {
    id: 9,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    pertanyaan: 'Berapakah jumlah baris dalam satu bait gurindam?',
    pilihan: ['2 baris', '3 baris', '4 baris', '6 baris'],
    jawabanIndex: 0,
    pembahasan: 'Setiap bait gurindam terdiri atas 2 baris (sepasang kalimat) yang membentuk satu kesatuan makna.'
  },
  {
    id: 10,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    pertanyaan: 'Pola rima pada satu bait gurindam adalah ....',
    pilihan: ['a-b', 'a-a', 'a-b-a-b', 'a-a-b-b'],
    jawabanIndex: 1,
    pembahasan: 'Kedua baris dalam satu bait gurindam memiliki bunyi akhir yang sama, yaitu berpola rima a-a.'
  },
  {
    id: 11,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    pertanyaan: 'Siapakah sastrawan terkenal pengarang "Gurindam Dua Belas"?',
    pilihan: [
      'Chairil Anwar',
      'Raja Ali Haji',
      'Hamzah Fansuri',
      'Amir Hamzah'
    ],
    jawabanIndex: 1,
    pembahasan: 'Raja Ali Haji dari Kepulauan Riau adalah tokoh sastrawan Melayu yang menggubah Gurindam Dua Belas.'
  },
  {
    id: 12,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    pertanyaan: 'Hubungan antara baris pertama dan baris kedua dalam gurindam adalah ....',
    pilihan: [
      'Sampiran dan isi',
      'Pertanyaan dan teka-teki',
      'Sebab/syarat dan akibat/jawaban',
      'Pembuka dan penutup cerita'
    ],
    jawabanIndex: 2,
    pembahasan: 'Baris pertama gurindam berisi persoalan, syarat, atau sebab, sedangkan baris kedua berisi jawaban atau akibatnya.'
  },
  {
    id: 13,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    kutipan: 'Jalan-jalan ke Kota Blitar,\nJangan lupa membeli sukun.\nKalau ingin menjadi pintar,\nHarus belajar dengan tekun.',
    pertanyaan: 'Berdasarkan isinya, pantun di atas termasuk jenis pantun ....',
    pilihan: ['Pantun jenaka', 'Pantun teka-teki', 'Pantun nasihat', 'Pantun berkasih-kasihan'],
    jawabanIndex: 2,
    pembahasan: 'Isi pantun mengajak pembaca untuk tekun belajar agar pintar, sehingga termasuk pantun nasihat.'
  },
  {
    id: 14,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    kutipan: 'Ada katak memakai dasi,\nDuduk santai di atas batu.\nTerkekeh lihat ayam berdasi,\nMencari cacing lupa waktu.',
    pertanyaan: 'Pantun yang bertujuan menghibur dan mengundang tawa seperti contoh di atas disebut pantun ....',
    pilihan: ['Agama', 'Jenaka', 'Adat', 'Kepahlawanan'],
    jawabanIndex: 1,
    pembahasan: 'Pantun jenaka berisi hal-hal lucu yang bertujuan menghibur pendengar atau pembaca.'
  },
  {
    id: 15,
    materi: 'Syair',
    kesulitan: 'Mudah',
    kutipan: 'Wahai ananda dengarlah pesan,\nJanganlah suka bersikap bosan.\nTuntutlah ilmu sepanjang zaman,\nAgar hidupmu penuh kenyamanan.',
    pertanyaan: 'Mengapa kutipan di atas digolongkan sebagai syair?',
    pilihan: [
      'Memiliki 2 baris berima a-a',
      'Bersajak a-b-a-b dan punya sampiran',
      'Bersajak a-a-a-a dan seluruh barisnya berupa isi',
      'Terdiri atas 6 baris dalam satu bait'
    ],
    jawabanIndex: 2,
    pembahasan: 'Kutipan berakhiran -san, -san, -man, -man (bunyi -an pada keempat baris, a-a-a-a) dan semuanya berisi nasihat.'
  },
  {
    id: 16,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    kutipan: 'Jika hendak mengenal orang mulia,\nLihatlah kepada kelakuan dia.',
    pertanyaan: 'Jenis puisi rakyat pada kutipan di atas adalah ....',
    pilihan: ['Pantun kilat', 'Syair nasihat', 'Gurindam', 'Talibun'],
    jawabanIndex: 2,
    pembahasan: 'Terdiri atas 2 baris berima a-a (-ia, -ia) yang menyatakan syarat dan akibat, ciri khas gurindam.'
  },
  {
    id: 17,
    materi: 'Pantun',
    kesulitan: 'Mudah',
    pertanyaan: 'Pantun yang hanya terdiri atas dua baris (baris 1 sampiran, baris 2 isi) disebut ....',
    pilihan: ['Karmina', 'Talibun', 'Seloka', 'Syair'],
    jawabanIndex: 0,
    pembahasan: 'Karmina sering disebut pantun kilat karena hanya memiliki 2 baris: baris pertama sampiran dan baris kedua isi.'
  },
  {
    id: 18,
    materi: 'Syair',
    kesulitan: 'Mudah',
    pertanyaan: 'Syair biasanya disusun menjadi banyak bait karena berfungsi untuk ....',
    pilihan: [
      'Memberikan tebakan singkat',
      'Menyampaikan cerita atau nasihat panjang secara berkesinambungan',
      'Menuliskan daftar belanja sehari-hari',
      'Menggantikan dialog drama modern'
    ],
    jawabanIndex: 1,
    pembahasan: 'Bait-bait syair saling berangkai untuk mengisahkan cerita panjang atau nasihat yang utuh.'
  },
  {
    id: 19,
    materi: 'Gurindam',
    kesulitan: 'Mudah',
    pertanyaan: 'Pada umumnya, isi dari sebuah gurindam berfokus pada ....',
    pilihan: [
      'Lelucon tentang hewan',
      'Kisah perang kerajaan',
      'Nasihat moral, budi pekerti, dan kebenaran hidup',
      'Teka-teki benda sehari-hari'
    ],
    jawabanIndex: 2,
    pembahasan: 'Gurindam sarat dengan nilai moral, budi pekerti, agama, dan filosofi hidup.'
  },
  {
    id: 20,
    materi: 'Syair',
    kesulitan: 'Mudah',
    pertanyaan: 'Berikut ini yang BUKAN termasuk ciri-ciri syair adalah ....',
    pilihan: [
      'Tiap bait terdiri atas empat baris',
      'Memiliki bagian sampiran dan isi',
      'Semua baris merupakan kalimat isi',
      'Bersajak rata a-a-a-a'
    ],
    jawabanIndex: 1,
    pembahasan: 'Syair tidak memiliki sampiran; semua barisnya merupakan isi yang bersajak rata a-a-a-a.'
  },

  // =========================================================
  // TINGKAT KESULITAN: SEDANG (20 SOAL: ID 21 - 40)
  // =========================================================
  {
    id: 21,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Berakit-rakit ke hulu,\nBerenang-renang ke tepian.\n[...],\n[...].',
    pertanyaan: 'Baris isi yang paling tepat untuk melengkapi pantun tersebut adalah ....',
    pilihan: [
      'Bersusah-susah dahulu,\nBersenang-senang kemudian.',
      'Rajin belajar dari dulu,\nAgar lulus saat ujian.',
      'Jangan lupa membawa buku,\nSupaya pintar di masa depan.',
      'Bersakit-sakit kemudian,\nBersenang-senang dahulu.'
    ],
    jawabanIndex: 0,
    pembahasan: 'Rima sampiran berpola -lu dan -an. Pasangan isi paling tepat dan sesuai kaidah adalah "Bersusah-susah dahulu / Bersenang-senang kemudian".'
  },
  {
    id: 22,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Beli kain di Pasar Baru,\nKain batik indah coraknya.\n[...],\nAgar terang jalan hidupnya.',
    pertanyaan: 'Larik ketiga yang tepat untuk melengkapi pantun di atas adalah ....',
    pilihan: [
      'Hormatilah ayah dan ibu',
      'Janganlah malas membaca buku',
      'Mari kita menuntut ilmu',
      'Rajinlah bekerja setiap waktu'
    ],
    jawabanIndex: 2,
    pembahasan: 'Rima baris ke-1 berakhiran "-ru" atau bunyi vokal "u", sehingga "Mari kita menuntut ilmu" (-mu) paling selaras makna dengan baris ke-4.'
  },
  {
    id: 23,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Kurang pikir kurang siasat,\nTentu dirimu kelak tersesat.',
    pertanyaan: 'Amanat utama yang terkandung dalam gurindam tersebut adalah ....',
    pilihan: [
      'Kita harus rajin berjalan-jalan agar tidak tersesat',
      'Berpikirlah matang sebelum bertindak agar tidak celaka atau salah langkah',
      'Orang yang cerdas tidak perlu membuat rencana',
      'Kesalahan di jalan hanya terjadi pada malam hari'
    ],
    jawabanIndex: 1,
    pembahasan: 'Gurindam menasihati agar setiap tindakan dipikirkan dan direncanakan matang supaya tidak berujung penyesalan.'
  },
  {
    id: 24,
    materi: 'Syair',
    kesulitan: 'Sedang',
    kutipan: 'Ilmu itu bekalan hidup,\nMenerangi jalan kala redup.\nJangan biarkan semangat tutup,\n[...].',
    pertanyaan: 'Larik yang tepat untuk melengkapi syair di atas agar rima dan maknanya padu adalah ....',
    pilihan: [
      'Supaya kita menjadi kaya',
      'Walau rintangan datang mengatup',
      'Pergilah bermain ke tepi pantai',
      'Karena hari sudah semakin malam'
    ],
    jawabanIndex: 1,
    pembahasan: 'Ketiga baris sebelumnya berakhiran "-up" (hidup, redup, tutup) dengan tema semangat menuntut ilmu, sehingga "mengatup" paling padu.'
  },
  {
    id: 25,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Kalau tuan pergi ke kedai,\nBelikan saya buah kuini.\nKalau tuan memanglah pandai,\nBinatang apa tanduk di kaki?',
    pertanyaan: 'Berdasarkan isinya, pantun di atas termasuk pantun ....',
    pilihan: ['Pantun adat', 'Pantun nasihat', 'Pantun teka-teki', 'Pantun agama'],
    jawabanIndex: 2,
    pembahasan: 'Baris isi mengajukan pertanyaan tebakan ("Binatang apa tanduk di kaki?" yaitu ayam jantan yang bertaji).'
  },
  {
    id: 26,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Barang siapa tiada memegang agama,\nSekali-kali tiada boleh dibilangkan nama.',
    pertanyaan: 'Makna larik kedua gurindam dari Raja Ali Haji tersebut adalah ....',
    pilihan: [
      'Orang yang beragama tidak boleh punya nama',
      'Orang yang tidak berpegang pada nilai agama tidak akan dihargai kehormatannya',
      'Nama seseorang harus ditulis dalam kitab',
      'Agama hanya untuk orang-orang terkenal saja'
    ],
    jawabanIndex: 1,
    pembahasan: '"Tiada boleh dibilangkan nama" berarti tidak pantas disebut sebagai orang yang terhormat atau mulia.'
  },
  {
    id: 27,
    materi: 'Syair',
    kesulitan: 'Sedang',
    pertanyaan: 'Manakah pernyataan yang paling tepat membedakan syair dengan pantun?',
    pilihan: [
      'Syair memiliki 2 baris per bait, sedangkan pantun 4 baris',
      'Pantun bersajak a-a-a-a, sedangkan syair bersajak a-b-a-b',
      'Syair semua barisnya isi dengan sajak a-a-a-a, sedangkan pantun punya sampiran dan sajak a-b-a-b',
      'Pantun berasal dari Arab, sedangkan syair asli dari Jawa'
    ],
    jawabanIndex: 2,
    pembahasan: 'Perbedaan pokoknya terletak pada keberadaan sampiran (hanya di pantun) dan pola rima (pantun a-b-a-b, syair a-a-a-a).'
  },
  {
    id: 28,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Apabila terpelihara lidah,\nNiscaya dapat daripadanya faedah.',
    pertanyaan: 'Kata "lidah" pada kutipan gurindam tersebut bermakna konotatif (kiasan) sebagai ....',
    pilihan: [
      'Indra pengecap makanan',
      'Ucapan atau perkataan seseorang',
      'Keberanian di medan perang',
      'Kecepatan membaca buku'
    ],
    jawabanIndex: 1,
    pembahasan: 'Memelihara lidah berarti menjaga lisan dan perkataan agar selalu santun serta membawa manfaat.'
  },
  {
    id: 29,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Pohon mangga berbuah lebat,\nJatuh sebiji di atas peti.\nJanganlah lupa pada sahabat,\n[...].',
    pertanyaan: 'Larik keempat yang tepat untuk menyempurnakan pantun di atas adalah ....',
    pilihan: [
      'Di dalam rumah berhati-hati',
      'Yang selalu tulus di dalam hati',
      'Membawa mangga setiap pagi',
      'Sebab buahnya manis sekali'
    ],
    jawabanIndex: 1,
    pembahasan: 'Baris ke-2 berakhiran "-ti" (peti), maka baris ke-4 harus berima "-ti" dan selaras dengan tema persahabatan.'
  },
  {
    id: 30,
    materi: 'Syair',
    kesulitan: 'Sedang',
    kutipan: 'Dengarlah kisah suatu riwayat,\nRaja di negeri penuh hikmat.\nAdil memerintah setiap saat,\nRakyat sejahtera hidup selamat.',
    pertanyaan: 'Berdasarkan isinya, kutipan syair tersebut termasuk jenis ....',
    pilihan: ['Syair panji / sejarah', 'Syair agama', 'Syair kiasan', 'Syair romantis'],
    jawabanIndex: 0,
    pembahasan: 'Syair yang mengisahkan riwayat raja dan kerajaan dengan tokoh serta latar istana termasuk syair sejarah atau panji.'
  },
  {
    id: 31,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Dengan bapa jangan durhaka,\nSupaya Allah tidak murka.',
    pertanyaan: 'Konjungsi (kata penghubung) yang menandai hubungan tujuan pada larik kedua gurindam di atas adalah ....',
    pilihan: ['Dengan', 'Jangan', 'Supaya', 'Tidak'],
    jawabanIndex: 2,
    pembahasan: 'Kata "supaya" merupakan konjungsi subordinatif yang menyatakan tujuan atau akibat yang diharapkan.'
  },
  {
    id: 32,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Anak ayam turun sepuluh,\nMati satu tinggallah sembilan.\nTuntutlah ilmu dengan bersungguh,\nSupaya tidak ketinggalan.',
    pertanyaan: 'Mengapa baris ke-1 dan ke-2 dalam pantun di atas disebut sampiran?',
    pilihan: [
      'Karena kedua baris itu berisi ajaran moral tentang ayam',
      'Karena kedua baris itu mengantar bunyi rima -uh dan -an sebelum masuk ke isi',
      'Karena jumlah suku katanya lebih sedikit daripada isi',
      'Karena kalimatnya menggunakan bahasa daerah'
    ],
    jawabanIndex: 1,
    pembahasan: 'Sampiran berfungsi menyiapkan bunyi akhir (rima) serta ritme agar selaras dengan baris isi ke-3 dan ke-4.'
  },
  {
    id: 33,
    materi: 'Syair',
    kesulitan: 'Sedang',
    kutipan: 'Wahai muda kenali dirimu,\nIalah perahu tamsil tubuhmu.\nTiadalah berapa lama hidupmu,\nKe akhirat jua kekal diammu.',
    pertanyaan: 'Perumpamaan "perahu" dalam syair Hamzah Fansuri di atas melambangkan ....',
    pilihan: [
      'Kendaraan untuk mencari ikan di laut',
      'Kehidupan atau raga manusia yang berlayar sementara di dunia',
      'Kekayaan harta benda yang melimpah',
      'Kekuatan pasukan kerajaan maritim'
    ],
    jawabanIndex: 1,
    pembahasan: 'Dalam syair perahu tersebut, perahu menjadi kiasan bagi tubuh dan perjalanan hidup manusia di dunia.'
  },
  {
    id: 34,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Cahari olehmu akan sahabat,\n[...].',
    pertanyaan: 'Baris kedua yang tepat untuk melengkapi gurindam Raja Ali Haji di atas adalah ....',
    pilihan: [
      'Yang dapat membantumu mencari harta',
      'Yang boleh dijadikan obat',
      'Yang selalu memuji setiap saat',
      'Yang tinggal di seberang barat'
    ],
    jawabanIndex: 1,
    pembahasan: 'Dalam Gurindam Dua Belas Pasal ke-6 tertulis: "Cahari olehmu akan sahabat / yang boleh dijadikan obat" (rima -bat, sahabat sejati sebagai penawar duka).'
  },
  {
    id: 35,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    pertanyaan: 'Dalam struktur kalimat pantun, manakah pilihan kata yang paling lazim ditemukan pada bagian isi pantun nasihat?',
    pilihan: [
      'Kalimat perintah atau ajakan (seperti "janganlah", "hendaklah", "marilah")',
      'Kalimat berita tentang nama-nama tumbuhan',
      'Kata seru untuk menakut-nakuti pembaca',
      'Kalimat pasif tanpa subjek'
    ],
    jawabanIndex: 0,
    pembahasan: 'Pantun nasihat sering memakai kalimat persuasif atau imperatif seperti "janganlah", "hendaklah", dan "marilah" pada bagian isi.'
  },
  {
    id: 36,
    materi: 'Syair',
    kesulitan: 'Sedang',
    pertanyaan: 'Syair yang menggunakan tokoh hewan, bunga, atau buah sebagai perlambang untuk menyindir peristiwa tertentu disebut ....',
    pilihan: ['Syair kiasan', 'Syair agama', 'Syair jenaka', 'Syair sejarah'],
    jawabanIndex: 0,
    pembahasan: 'Syair kiasan memakai lambang fauna/flora (misalnya Syair Burung Pungguk atau Syair Ikan Terubuk) untuk menyindir keadaan manusia.'
  },
  {
    id: 37,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Hati ini kerajaan di dalam tubuh,\nJikalau zalim segala anggota pun roboh.',
    pertanyaan: 'Pesan utama yang ingin disampaikan oleh bait gurindam tersebut adalah ....',
    pilihan: [
      'Kerajaan harus dipimpin oleh prajurit bertubuh besar',
      'Kebersihan hati menentukan baik buruknya seluruh perbuatan anggota tubuh',
      'Olahraga setiap pagi membuat tubuh tidak mudah roboh',
      'Orang yang sakit hati tidak boleh memimpin negara'
    ],
    jawabanIndex: 1,
    pembahasan: 'Hati diibaratkan sebagai raja; jika hati rusak atau zalim, seluruh perilaku anggota tubuh ikut rusak.'
  },
  {
    id: 38,
    materi: 'Pantun',
    kesulitan: 'Sedang',
    kutipan: 'Bunga melati di tepi telaga,\nHarum semerbak di waktu pagi.\nBudi pekerti wajib dijaga,\nItulah bekal hidup hakiki.',
    pertanyaan: 'Makna kata "hakiki" pada baris keempat pantun di atas adalah ....',
    pilihan: ['Sementara', 'Palsu', 'Sebenarnya / sejati', 'Tersembunyi'],
    jawabanIndex: 2,
    pembahasan: 'Menurut KBBI, "hakiki" bermakna benar, sebenarnya, atau sejati.'
  },
  {
    id: 39,
    materi: 'Syair',
    kesulitan: 'Sedang',
    pertanyaan: 'Jumlah kata pada setiap baris syair umumnya terdiri atas ....',
    pilihan: [
      '1 sampai 2 kata saja',
      '4 sampai 5 kata (sekitar 8–14 suku kata)',
      '10 sampai 12 kata',
      'Lebih dari 20 kata'
    ],
    jawabanIndex: 1,
    pembahasan: 'Setiap baris syair lazim terdiri atas 4 hingga 5 kata (8–14 suku kata) sehingga memiliki jeda irama yang teratur.'
  },
  {
    id: 40,
    materi: 'Gurindam',
    kesulitan: 'Sedang',
    kutipan: 'Apabila banyak berkata-kata,\nDi situlah jalan masuk dusta.',
    pertanyaan: 'Perilaku yang dianjurkan berdasarkan gurindam di atas adalah ....',
    pilihan: [
      'Berbicara seperlunya dan penuh kejujuran agar terhindar dari kebohongan',
      'Berdiam diri sepanjang hari tanpa berbicara kepada siapa pun',
      'Selalu berbicara cepat agar orang lain percaya',
      'Menghindari diskusi di dalam kelas'
    ],
    jawabanIndex: 0,
    pembahasan: 'Terlalu banyak bicara tanpa kendali memperbesar peluang terucapnya kebohongan; karena itu lisan perlu dijaga.'
  },

  // =========================================================
  // TINGKAT KESULITAN: SULIT (20 SOAL: ID 41 - 60)
  // =========================================================
  {
    id: 41,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    kutipan: '(1) Pergi memancing ke Sungai Musi,\n(2) Umpan dipasang di mata kail.\n(3) Kalau ingin meraih prestasi,\n(4) Belajar giat sejak masih kecil.',
    pertanyaan: 'Analisislah rima pantun di atas! Bagian manakah yang menyimpang dari kaidah rima sempurna pantun?',
    pilihan: [
      'Baris (1) dan (3) karena berakhiran -si',
      'Baris (2) dan (4) karena "kail" (-il) dan "kecil" (-cil) masih berima, tetapi jeda suku katanya tidak seimbang',
      'Tidak ada penyimpangan karena -si/-si dan -il/-il memenuhi rima silang a-b-a-b',
      'Baris (1) dan (2) karena membahas sungai dan ikan sekaligus'
    ],
    jawabanIndex: 2,
    pembahasan: 'Musi (-si) & prestasi (-si) berima sama; kail (-il) & kecil (-il) juga berima akhir sama (-il). Jadi pola a-b-a-b terpenuhi.'
  },
  {
    id: 42,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Teks A: "Barang siapa meninggalkan sembahyang / Seperti rumah tiada bertiang."\nTeks B: "Pergi ke hutan membawa parang / Hati senang tiada terkira."',
    pertanyaan: 'Mengapa Teks A disebut gurindam sedangkan Teks B bukan gurindam yang utuh?',
    pilihan: [
      'Teks A memiliki 2 baris bersajak a-a dengan hubungan sebab-akibat, sedangkan Teks B tidak bersajak sama dan bukan sebab-akibat',
      'Teks A berasal dari Jawa dan Teks B berasal dari Sumatra',
      'Teks B terlalu pendek suku katanya dibandingkan Teks A',
      'Teks A memakai kata ganti orang pertama'
    ],
    jawabanIndex: 0,
    pembahasan: 'Gurindam mensyaratkan sajak a-a serta relasi syarat-akibat atau perumpamaan bermakna moral. Teks B berakhir -ang dan -ra (tidak berima a-a) dan tidak padu.'
  },
  {
    id: 43,
    materi: 'Syair',
    kesulitan: 'Sulit',
    kutipan: 'Janganlah tuan berhati bimbang,\nLihatlah ombak terus menerjang.\nMeski perahu nyaris tumbang,\nTuhan menjaga sepanjang petang.',
    pertanyaan: 'Nilai kehidupan dan majas apa yang paling menonjol dalam kutipan syair tersebut?',
    pilihan: [
      'Nilai sosial dan majas ironi',
      'Nilai religius/keteguhan iman dengan metafora ombak dan perahu sebagai cobaan hidup',
      'Nilai budaya dan majas hiperbola tentang nelayan kaya',
      'Nilai ekonomi tentang perdagangan laut'
    ],
    jawabanIndex: 1,
    pembahasan: '"Ombak menerjang" dan "perahu nyaris tumbang" menjadi metafora ujian hidup, disertai pesan keteguhan iman kepada Tuhan.'
  },
  {
    id: 44,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    kutipan: 'Ke pasar membeli ikan kakap,\nPulangnya singgah membeli duku.\nJadilah anak yang beradab,\nHormati guru dan orang tuamu.',
    pertanyaan: 'Evaluasilah kesesuaian pola rima pantun di atas!',
    pilihan: [
      'Sudah tepat karena bersajak a-b-a-b',
      'Kurang tepat karena bunyi akhir baris 1 (-kap) tidak berima sama dengan baris 3 (-dab), dan baris 2 (-ku) tidak berima sempurna dengan baris 4 (-mu) jika mengacu rima konsonan-vokal',
      'Sudah tepat karena semua baris berakhir dengan vokal u',
      'Salah karena jumlah barisnya hanya empat'
    ],
    jawabanIndex: 1,
    pembahasan: 'Rima silang sempurna menuntut kesamaan bunyi akhir baris 1 & 3 (-kap vs -dab tidak berima) serta baris 2 & 4 (-ku vs -mu hanya asonansi vokal "u", kurang tepat di baris 1 & 3).'
  },
  {
    id: 45,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Jika hendak mengenal orang berbangsa,\nLihat kepada budi dan bahasa.',
    pertanyaan: 'Dalam konteks Gurindam Dua Belas karya Raja Ali Haji, makna frasa "orang berbangsa" adalah ....',
    pilihan: [
      'Orang yang memiliki paspor dari negara besar',
      'Orang yang berbudi luhur, terhormat, dan beradab mulia',
      'Orang yang menguasai banyak bahasa asing',
      'Orang yang sering memimpin upacara kenegaraan'
    ],
    jawabanIndex: 1,
    pembahasan: 'Dalam bahasa Melayu klasik, "berbangsa" merujuk pada kebangsawanan budi/martabat luhur yang diukur dari akhlak dan kesantunan bahasa.'
  },
  {
    id: 46,
    materi: 'Syair',
    kesulitan: 'Sulit',
    kutipan: 'Bait 1: Di sebuah negeri bernama Pasai / Hidup seorang putri permai.\nBait 2: Wajahnya lembut bagai purnama / Tutur katanya menyejukkan sukma.',
    pertanyaan: 'Jika dua bait di atas digabung dalam satu syair naratif, kesalahan struktur apa yang terlihat pada Bait 1 dan 2?',
    pilihan: [
      'Bait 1 dan 2 masing-masing hanya memiliki 2 baris (seharusnya 4 baris per bait untuk syair standar)',
      'Bait 1 dan 2 menggunakan bahasa Indonesia baku',
      'Bait 2 menceritakan sifat tokoh utama',
      'Rima Bait 1 menggunakan akhiran -ai'
    ],
    jawabanIndex: 0,
    pembahasan: 'Syair memiliki struktur 4 baris per bait bersajak a-a-a-a. Kutipan yang hanya 2 baris per bait menyalahi kaidah jumlah larik syair.'
  },
  {
    id: 47,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    pertanyaan: 'Jika sebuah puisi rakyat terdiri atas 6 baris dalam satu bait dengan 3 baris pertama sampiran, 3 baris berikutnya isi, dan berpola rima a-b-c-a-b-c, maka puisi tersebut disebut ....',
    pilihan: ['Karmina', 'Syair berangkai', 'Talibun', 'Seloka'],
    jawabanIndex: 2,
    pembahasan: 'Talibun adalah pantun yang jumlah baris per baitnya genap lebih dari 4 (6, 8, 10, atau 12 baris) dengan separuh sampiran dan separuh isi.'
  },
  {
    id: 48,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Pekerjaan marah jangan dibela,\nNanti hilang akal di kepala.',
    pertanyaan: 'Apa arti ungkapan "jangan dibela" pada larik pertama gurindam tersebut?',
    pilihan: [
      'Jangan dipertahankan, dituruti, atau dibenarkan',
      'Jangan dilaporkan kepada petugas keamanan',
      'Jangan dihindari ketika sedang bekerja',
      'Jangan diceritakan kepada teman dekat'
    ],
    jawabanIndex: 0,
    pembahasan: 'Membela amarah berarti membenarkan atau menuruti nafsu marah, yang akibatnya dapat menghilangkan akal sehat.'
  },
  {
    id: 49,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    kutipan: 'Tumbuh merata pohon tebu,\nPergi ke pasar membeli daging.\nBanyak harta miskin ilmu,\nBagai rumah tidak berdinding.',
    pertanyaan: 'Pesan kiasan "Bagai rumah tidak berdinding" pada isi pantun tersebut bermakna ....',
    pilihan: [
      'Rumah orang kaya biasanya memakai kaca bening',
      'Kekayaan materi tanpa ilmu pengetahuan tidak memberi perlindungan atau kehormatan sejati',
      'Menanam tebu lebih menguntungkan daripada membangun rumah',
      'Ilmu hanya berguna bagi orang yang ingin membeli rumah'
    ],
    jawabanIndex: 1,
    pembahasan: 'Harta melimpah tanpa ilmu ibarat rumah tanpa dinding—rapuh dan tidak mampu menjaga keselamatan maupun martabat pemiliknya.'
  },
  {
    id: 50,
    materi: 'Syair',
    kesulitan: 'Sulit',
    kutipan: 'Asal mula syair hamba karangkan,\nKisah pedagang di negeri seberang.\nSabar menghadapi segala halangan,\nHingga sukses tiada kepalang.',
    pertanyaan: 'Ditinjau dari kaidah persajakan syair, kata manakah yang merusak pola rima rata a-a-a-a?',
    pilihan: [
      '"karangkan" (baris 1)',
      '"seberang" (baris 2) karena berakhir "-rang" sementara baris 1, 3, 4 berakhir "-an/-ang" tidak konsisten dengan "-kan/-gan/-lang"',
      '"halangan" (baris 3)',
      '"kepalang" (baris 4)'
    ],
    jawabanIndex: 1,
    pembahasan: 'Baris 1 (-kan), 3 (-ngan) berakhiran bunyi "-an", sedangkan baris 2 (-rang) dan 4 (-lang) berakhiran "-ang". Khususnya baris 2 tidak selaras vokal/konsonan penutup dengan pola "-an" atau "-ang" secara utuh.'
  },
  {
    id: 51,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Hendaklah berjasa kepada yang sebangsa,\nSupaya namamu dikenang sepanjang masa.',
    pertanyaan: 'Perbedaan struktur klausa antara larik pertama dan kedua pada gurindam di atas adalah ....',
    pilihan: [
      'Larik 1 berupa kalimat ajakan/anjuran, larik 2 berupa klausa tujuan/hasil',
      'Larik 1 berupa kalimat tanya, larik 2 berupa kalimat seru',
      'Larik 1 berupa sampiran alam, larik 2 berupa teka-teki',
      'Keduanya merupakan kalimat pasif tanpa predikat'
    ],
    jawabanIndex: 0,
    pembahasan: '"Hendaklah..." menandai kalimat ajakan/syarat (larik 1), dan "Supaya..." menandai klausa tujuan/akibat positif (larik 2).'
  },
  {
    id: 52,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    kutipan: 'Bait 1: Jalan ke desa melewati kali / Airnya jernih sejukkan hati / Jika engkau ingin berbudi / Jauhi sifat iri dan dengki.\nBait 2: ... / ... / Jika jauhi iri dan dengki / Hidupmu damai penuh harmoni.',
    pertanyaan: 'Hubungan antarbait di mana isi bait pertama diulang menjadi bagian dari bait berikutnya disebut ....',
    pilihan: ['Pantun berkait (seloka)', 'Gurindam berantai', 'Syair pujian', 'Karmina ganda'],
    jawabanIndex: 0,
    pembahasan: 'Pantun berkait atau seloka merupakan rangkaian pantun yang barisnya saling sambung-menyambung antar-bait.'
  },
  {
    id: 53,
    materi: 'Syair',
    kesulitan: 'Sulit',
    pertanyaan: 'Mengapa syair tidak mengenal pemisahan sampiran dan isi seperti pantun?',
    pilihan: [
      'Karena syair hanya boleh dibacakan oleh satu orang tanpa musik',
      'Karena syair berfungsi menuturkan alur kisah atau ajaran panjang secara beruntun tanpa jeda pengantar bunyi terpisah',
      'Karena syair tidak terikat aturan jumlah baris maupun rima',
      'Karena syair selalu diterjemahkan langsung dari pantun kilat'
    ],
    jawabanIndex: 1,
    pembahasan: 'Fungsi naratif/didaktis berkesinambungan pada syair menuntut seluruh baris langsung membawa gagasan cerita atau ajaran.'
  },
  {
    id: 54,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Barang siapa mengenal dunia,\nTahulah ia barang yang teperdaya.',
    pertanyaan: 'Makna filosofis dari bait gurindam di atas adalah ....',
    pilihan: [
      'Orang yang menghafal peta dunia pasti menang dalam perdebatan',
      'Orang yang memahami hakikat fana dunia akan sadar akan tipu daya kesenangan semu',
      'Semua penduduk dunia mudah tertipu oleh pedagang',
      'Penjelajah dunia tidak pernah merasa lelah'
    ],
    jawabanIndex: 1,
    pembahasan: 'Memahami sifat sementara kehidupan dunia membuat seseorang waspada terhadap godaan atau kesenangan yang menipu ("teperdaya").'
  },
  {
    id: 55,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    kutipan: 'Beli terasi di Kota Jambi,\nJangan lupa membeli talas.\nWalau prestasi sudah tinggi,\nJanganlah pernah bersikap malas.',
    pertanyaan: 'Hitunglah jumlah suku kata pada baris keempat ("Janganlah pernah bersikap malas")!',
    pilihan: ['8 suku kata', '10 suku kata', '11 suku kata', '13 suku kata'],
    jawabanIndex: 1,
    pembahasan: 'Ja-ngan-lah (3) per-nah (2) ber-si-kap (3) ma-las (2) = 3 + 2 + 3 + 2 = 10 suku kata (ideal untuk pantun).'
  },
  {
    id: 56,
    materi: 'Syair',
    kesulitan: 'Sulit',
    kutipan: 'Wahai ananda intan pilihan,\nBersihkan hati dari kesalahan.\nJanganlah ikut hawa kemarahan,\nNiscaya hidup mendapat berkah-Nya Tuhan.',
    pertanyaan: 'Manakah aspek kebahasaan klasik yang tampak pada kata "hamba/ananda" dan "niscaya" dalam syair tersebut?',
    pilihan: [
      'Penggunaan kata sapaan hormat/kasih sayang Melayu klasik serta kata penegas akibat',
      'Penggunaan kata serapan bahasa Inggris modern',
      'Penggunaan ragam bahasa gaul perkotaan',
      'Penggunaan istilah ilmiah biologi'
    ],
    jawabanIndex: 0,
    pembahasan: 'Sapaan "ananda" dan kata arkais/klasik "niscaya" merupakan ciri khas diksi sastra Melayu lama dalam syair nasihat.'
  },
  {
    id: 57,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    pertanyaan: 'Pasangan manakah yang paling tepat menggambarkan perbedaan jumlah baris, rima, dan struktur makna antara Pantun, Syair, dan Gurindam?',
    pilihan: [
      'Pantun: 4 baris, a-b-a-b, sampiran+isi | Syair: 4 baris, a-a-a-a, semua isi | Gurindam: 2 baris, a-a, sebab+akibat',
      'Pantun: 2 baris, a-a, semua isi | Syair: 4 baris, a-b-a-b, sampiran+isi | Gurindam: 4 baris, a-a-a-a, teka-teki',
      'Pantun: 4 baris, a-a-a-a, sebab+akibat | Syair: 2 baris, a-b, sampiran+isi | Gurindam: 6 baris, a-b-c-a-b-c, semua isi',
      'Pantun: 4 baris, a-b-a-b, semua isi | Syair: 4 baris, a-a-b-b, sampiran+isi | Gurindam: 2 baris, a-b, cerita rakyat'
    ],
    jawabanIndex: 0,
    pembahasan: 'Ringkasan kaidah: Pantun (4 baris, a-b-a-b, sampiran+isi), Syair (4 baris, a-a-a-a, semua isi), Gurindam (2 baris, a-a, syarat/sebab+akibat).'
  },
  {
    id: 58,
    materi: 'Pantun',
    kesulitan: 'Sulit',
    pertanyaan: 'Mengapa sampiran pantun sering mengangkat citraan alam atau kegiatan sehari-hari sebelum menyampaikan isi?',
    pilihan: [
      'Karena pembuat pantun tidak tahu cara menulis langsung ke inti pesan',
      'Karena budaya masyarakat Melayu lama akrab dengan alam, sekaligus berfungsi membangun irama, rima, dan daya bayang pendengar',
      'Karena aturan hukum adat melarang menyebut manusia di baris pertama',
      'Karena sampiran sebenarnya adalah ringkasan dari baris isi'
    ],
    jawabanIndex: 1,
    pembahasan: 'Citraan alam pada sampiran mencerminkan kedekatan budaya masyarakat Nusantara dengan alam sekaligus menyiapkan rima dan suasana batin sebelum isi.'
  },
  {
    id: 59,
    materi: 'Syair',
    kesulitan: 'Sulit',
    kutipan: 'Tersebutlah kisah burung nuri,\nTerbang tinggi menjelang pagi.\nMencari ilmu tiada henti,\nUntuk bekal di kemudian hari.',
    pertanyaan: 'Perhatikan akhiran kata tiap baris: "nuri", "pagi", "henti", "hari". Bagaimana analisis rima syair tersebut?',
    pilihan: [
      'Bukan syair karena huruf konsonan sebelum "i" berbeda-beda',
      'Memenuhi rima asonansi/akhir vokal "-i" (a-a-a-a) yang lazim digunakan dalam syair, meski rima mutlak suku kata akhirnya bervariasi (-ri, -gi, -ti, -ri)',
      'Merupakan pantun karena ada burung nuri di baris pertama',
      'Termasuk gurindam empat baris'
    ],
    jawabanIndex: 1,
    pembahasan: 'Dalam syair, rima rata a-a-a-a sering diwujudkan lewat kesamaan vokal akhir (-i), walaupun rima sempurna (-ri/-ri) dianggap lebih kuat.'
  },
  {
    id: 60,
    materi: 'Gurindam',
    kesulitan: 'Sulit',
    kutipan: 'Ingat sebelum kena,\nHemat sebelum habis.',
    pertanyaan: 'Meskipun sering dianggap peribahasa, jika ditinjau dari bentuknya larik "Ingat sebelum kena / Hemat sebelum habis" mendekati struktur gurindam karena ....',
    pilihan: [
      'Memiliki 2 baris nasihat berpasangan dengan pola sebab-akibat/antisipasi, namun berbeda dari gurindam klasik karena bunyi akhirnya tidak bersajak a-a',
      'Terdiri atas 4 baris dengan sampiran tentang uang',
      'Bersajak silang a-b-a-b sempurna',
      'Berisi kisah kepahlawanan Raja Ali Haji'
    ],
    jawabanIndex: 0,
    pembahasan: 'Strukturnya 2 larik nasihat paralel yang mengingatkan sebab-akibat, tetapi tidak bersajak a-a ("kena" vs "habis") sehingga bukan gurindam murni.'
  }
];
