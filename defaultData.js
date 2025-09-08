/**
 * Data akun default untuk UKM sesuai SAK EMKM
 * Kode akun sederhana dan nama yang mudah dipahami
 */

export const defaultAccounts = [
  // ==============================================
  // 1. ASET (Assets) - 1xxx
  // ==============================================
  
  // ASET LANCAR (Current Assets)
  {
    name: 'Kas',
    code: '1101',
    category: 'KAS',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Uang tunai di tangan'
  },
  {
    name: 'Bank - Rekening Utama',
    code: '1201',
    category: 'BANK',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Rekening bank untuk operasional'
  },
  {
    name: 'Piutang Usaha',
    code: '1301',
    category: 'PIUTANG',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Tagihan kepada pelanggan'
  },
  {
    name: 'Piutang Lain-lain',
    code: '1302',
    category: 'PIUTANG',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Piutang selain dari penjualan utama'
  },
  {
    name: 'Persediaan Barang Dagang',
    code: '1401',
    category: 'PERSEDIAAN',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Stok barang untuk dijual'
  },
  {
    name: 'Perlengkapan',
    code: '1501',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Perlengkapan kantor dan operasional'
  },
  {
    name: 'Beban Dibayar Dimuka',
    code: '1601',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Pembayaran beban untuk periode mendatang'
  },
  {
    name: 'Pendapatan yang Masih Harus Diterima',
    code: '1701',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Pendapatan yang sudah terjadi tapi belum diterima'
  },
  
  // ASET TIDAK LANCAR (Non-Current Assets)
  {
    name: 'Tanah',
    code: '1801',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Tanah untuk usaha'
  },
  {
    name: 'Bangunan',
    code: '1802',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Gedung dan bangunan usaha'
  },
  {
    name: 'Kendaraan',
    code: '1803',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Kendaraan operasional'
  },
  {
    name: 'Peralatan',
    code: '1804',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Peralatan dan mesin usaha'
  },
  {
    name: 'Akumulasi Penyusutan - Bangunan',
    code: '1850',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Akumulasi penyusutan bangunan (kontra aset)'
  },
  {
    name: 'Akumulasi Penyusutan - Kendaraan',
    code: '1851',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Akumulasi penyusutan kendaraan (kontra aset)'
  },
  {
    name: 'Akumulasi Penyusutan - Peralatan',
    code: '1852',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Akumulasi penyusutan peralatan (kontra aset)'
  },
  {
    name: 'Investasi Jangka Panjang',
    code: '1901',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Investasi jangka panjang'
  },
  {
    name: 'Hak Paten',
    code: '1951',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Hak paten dan kekayaan intelektual'
  },
  {
    name: 'Goodwill',
    code: '1952',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Goodwill dan aset takberwujud'
  },
  {
    name: 'Lisensi',
    code: '1953',
    category: 'ASET',
    account_type: 'ASET',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Lisensi dan hak usaha'
  },

  // ==============================================
  // 2. KEWAJIBAN (Liabilities) - 2xxx
  // ==============================================
  
  // KEWAJIBAN JANGKA PENDEK (Current Liabilities)
  {
    name: 'Utang Usaha',
    code: '2101',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Utang kepada supplier'
  },
  {
    name: 'Utang Gaji',
    code: '2102',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Utang gaji karyawan'
  },
  {
    name: 'Utang Pajak',
    code: '2103',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Utang pajak penghasilan dan PPN'
  },
  {
    name: 'Beban yang Masih Harus Dibayar',
    code: '2104',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Beban yang sudah terjadi tapi belum dibayar'
  },
  {
    name: 'Pendapatan Diterima Dimuka',
    code: '2105',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Uang muka dari pelanggan'
  },
  
  // KEWAJIBAN JANGKA PANJANG (Long-term Liabilities)
  {
    name: 'Utang Bank',
    code: '2201',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Kredit atau pinjaman bank jangka panjang'
  },
  {
    name: 'Utang Obligasi',
    code: '2202',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Utang obligasi jangka panjang'
  },
  {
    name: 'Utang Hipotik',
    code: '2203',
    category: 'UTANG',
    account_type: 'LIABILITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Utang hipotik properti'
  },

  // ==============================================
  // 3. EKUITAS (Equity) - 3xxx
  // ==============================================
  {
    name: 'Modal Pemilik',
    code: '3101',
    category: 'MODAL',
    account_type: 'EKUITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Modal awal usaha dari pemilik'
  },
  {
    name: 'Prive',
    code: '3102',
    category: 'MODAL',
    account_type: 'EKUITAS',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Pengambilan dana oleh pemilik untuk keperluan pribadi'
  },
  {
    name: 'Laba Ditahan',
    code: '3201',
    category: 'MODAL',
    account_type: 'EKUITAS',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Akumulasi laba yang tidak dibagi kepada pemilik'
  },

  // ==============================================
  // 4. PENDAPATAN (Revenue) - 4xxx
  // ==============================================
  {
    name: 'Pendapatan Penjualan',
    code: '4101',
    category: 'PENDAPATAN',
    account_type: 'PENDAPATAN',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Pendapatan dari penjualan barang dan jasa utama'
  },
  {
    name: 'Pendapatan Bunga',
    code: '4201',
    category: 'PENDAPATAN',
    account_type: 'PENDAPATAN',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Pendapatan bunga dari deposito atau investasi'
  },
  {
    name: 'Pendapatan Sewa',
    code: '4202',
    category: 'PENDAPATAN',
    account_type: 'PENDAPATAN',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Pendapatan dari penyewaan aset'
  },
  {
    name: 'Pendapatan Royalti',
    code: '4203',
    category: 'PENDAPATAN',
    account_type: 'PENDAPATAN',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Pendapatan royalti dari hak kekayaan intelektual'
  },
  {
    name: 'Pendapatan Lain-lain',
    code: '4901',
    category: 'PENDAPATAN',
    account_type: 'PENDAPATAN',
    normal_balance: 'CREDIT',
    balance: 0,
    description: 'Pendapatan lain di luar usaha utama'
  },

  // ==============================================
  // 5. BEBAN (Expenses) - 5xxx
  // ==============================================
  {
    name: 'Beban Pokok Penjualan',
    code: '5101',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Harga pokok barang yang terjual'
  },
  {
    name: 'Beban Gaji',
    code: '5201',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Gaji dan upah karyawan'
  },
  {
    name: 'Beban Sewa',
    code: '5301',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya sewa tempat usaha dan peralatan'
  },
  {
    name: 'Beban Listrik',
    code: '5401',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya listrik dan penerangan'
  },
  {
    name: 'Beban Air',
    code: '5402',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya air bersih dan sanitasi'
  },
  {
    name: 'Beban Telepon',
    code: '5403',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya telepon dan komunikasi'
  },
  {
    name: 'Beban Perlengkapan',
    code: '5501',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya perlengkapan kantor yang terpakai'
  },
  {
    name: 'Beban Penyusutan Bangunan',
    code: '5601',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Beban penyusutan bangunan per periode'
  },
  {
    name: 'Beban Penyusutan Kendaraan',
    code: '5602',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Beban penyusutan kendaraan per periode'
  },
  {
    name: 'Beban Penyusutan Peralatan',
    code: '5603',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Beban penyusutan peralatan per periode'
  },
  {
    name: 'Beban Transportasi',
    code: '5701',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya transport dan bahan bakar'
  },
  {
    name: 'Beban Administrasi',
    code: '5801',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Biaya administrasi dan alat tulis kantor'
  },
  {
    name: 'Beban Pajak',
    code: '5802',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Beban pajak penghasilan dan pajak lainnya'
  },
  {
    name: 'Beban Lain-lain',
    code: '5901',
    category: 'BEBAN',
    account_type: 'BEBAN',
    normal_balance: 'DEBIT',
    balance: 0,
    description: 'Beban operasional lainnya yang tidak terkategorisasi'
  }
];

/**
 * Contoh transaksi awal untuk demo
 */
export const sampleTransactions = [
  {
    description: 'Modal awal usaha',
    debit_account_name: 'Kas',
    credit_account_name: 'Modal Pemilik',
    amount: 10000000,
    transaction_date: new Date().toISOString().split('T')[0]
  },
  {
    description: 'Pembelian peralatan',
    debit_account_name: 'Peralatan',
    credit_account_name: 'Kas',
    amount: 2000000,
    transaction_date: new Date().toISOString().split('T')[0]
  },
  {
    description: 'Penjualan pertama',
    debit_account_name: 'Kas',
    credit_account_name: 'Pendapatan Penjualan',
    amount: 500000,
    transaction_date: new Date().toISOString().split('T')[0]
  }
];