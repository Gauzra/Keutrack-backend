/**
 * Helper functions untuk klasifikasi akun SAK EMKM
 * Menentukan jenis akun dan normal balance secara konsisten
 */

/**
 * Menentukan tipe akun berdasarkan nama atau kode akun
 * ✅ SOLUSI LENGKAP: Mencegah semua kesalahan klasifikasi umum
 * @param {string} name - Nama akun
 * @param {string} code - Kode akun (opsional)
 * @returns {Object} - {type: string, normalBalance: string, category: string}
 */
export function classifyAccount(name, code = '') {
  const accountName = (name || '').toUpperCase().trim();
  const accountCode = (code || '').toString().trim();
  
  // ✅ SOLUSI 1: Validasi input terlebih dahulu
  if (!accountName) {
    console.warn('⚠️ [CLASSIFICATION] Account name is empty');
    return {
      type: 'LAIN',
      normalBalance: 'DEBIT',
      category: 'LAIN'
    };
  }
  
  console.log(`🔍 [CLASSIFICATION] Classifying: "${accountName}" (Code: ${accountCode})`);
  
  // ✅ PRIORITAS TERTINGGI: Berdasarkan kode SAK EMKM (lebih akurat)
  if (accountCode) {
    const classification = classifyByCode(accountCode, accountName);
    if (classification.type !== 'LAIN') {
      console.log(`✅ [CLASSIFICATION] Result by CODE: ${classification.type} (${classification.category})`);
      return classification;
    }
  }
  
  // ✅ SOLUSI 2: Cek BEBAN terlebih dahulu untuk mencegah salah klasifikasi
  // "Beban Listrik" harus jadi BEBAN, bukan ASET
  if (isExpenseAccount(accountName, accountCode)) {
    const result = {
      type: 'BEBAN',
      normalBalance: 'DEBIT',
      category: 'BEBAN'
    };
    console.log(`✅ [CLASSIFICATION] Result by NAME (EXPENSE): ${result.type}`);
    return result;
  }
  
  // ✅ SOLUSI 3: Cek PENDAPATAN dengan validasi ketat
  // "Pendapatan Penjualan" harus jadi PENDAPATAN, bukan EKUITAS/MODAL
  if (isRevenueAccount(accountName, accountCode)) {
    const result = {
      type: 'PENDAPATAN',
      normalBalance: 'CREDIT',
      category: 'PENDAPATAN'
    };
    console.log(`✅ [CLASSIFICATION] Result by NAME (REVENUE): ${result.type}`);
    return result;
  }
  
  // ✅ SOLUSI 4: ASET dengan pengecekan spesifik
  // "Perlengkapan" harus jadi ASET, bukan BEBAN
  if (isAssetAccount(accountName, accountCode)) {
    const result = {
      type: 'ASET',
      normalBalance: 'DEBIT',
      category: getAssetCategory(accountName)
    };
    console.log(`✅ [CLASSIFICATION] Result by NAME (ASSET): ${result.type} (${result.category})`);
    return result;
  }
  
  // LIABILITAS/UTANG (Normal Balance: CREDIT)
  if (isLiabilityAccount(accountName, accountCode)) {
    const result = {
      type: 'LIABILITAS', 
      normalBalance: 'CREDIT',
      category: 'UTANG'
    };
    console.log(`✅ [CLASSIFICATION] Result by NAME (LIABILITY): ${result.type}`);
    return result;
  }
  
  // ✅ SOLUSI 5: EKUITAS/MODAL dengan validasi
  // Hanya modal investasi & laba ditahan, bukan pendapatan
  if (isEquityAccount(accountName, accountCode)) {
    const result = {
      type: 'EKUITAS',
      normalBalance: 'CREDIT', 
      category: 'MODAL'
    };
    console.log(`✅ [CLASSIFICATION] Result by NAME (EQUITY): ${result.type}`);
    return result;
  }
  
  // Default untuk akun yang tidak dikenal
  console.warn(`⚠️ [CLASSIFICATION] Unknown account type: "${accountName}" (${accountCode}) -> Default to LAIN`);
  return {
    type: 'LAIN',
    normalBalance: 'DEBIT',
    category: 'LAIN'
  };
}

/**
 * ✅ SOLUSI: Klasifikasi berdasarkan kode SAK EMKM (paling akurat)
 * @param {string} code - Kode akun
 * @param {string} name - Nama akun untuk validasi
 * @returns {Object} - Klasifikasi berdasarkan kode
 */
function classifyByCode(code, name) {
  const firstDigit = code.charAt(0);
  
  switch (firstDigit) {
    case '1':
      return {
        type: 'ASET',
        normalBalance: 'DEBIT',
        category: getAssetCategory(name)
      };
    case '2':
      return {
        type: 'LIABILITAS',
        normalBalance: 'CREDIT',
        category: 'UTANG'
      };
    case '3':
      return {
        type: 'EKUITAS',
        normalBalance: 'CREDIT',
        category: 'MODAL'
      };
    case '4':
      return {
        type: 'PENDAPATAN',
        normalBalance: 'CREDIT',
        category: 'PENDAPATAN'
      };
    case '5':
      return {
        type: 'BEBAN',
        normalBalance: 'DEBIT',
        category: 'BEBAN'
      };
    default:
      return {
        type: 'LAIN',
        normalBalance: 'DEBIT',
        category: 'LAIN'
      };
  }
}

/**
 * ✅ SOLUSI: Cek apakah akun adalah ASET dengan validasi ketat
 * Fixes: "Perlengkapan dicatat ke Beban" & "Beban Perlengkapan vs Perlengkapan"
 */
function isAssetAccount(name, code) {
  const upperName = name.toUpperCase();
  const upperCode = code.toString();
  
  // ✅ PRIORITAS 1: Berdasarkan kode SAK EMKM (1xxx untuk ASET)
  if (upperCode.startsWith('1')) {
    console.log(`🎯 [ASSET-CODE] "${name}" classified as ASET (code: ${code})`);
    return true;
  }
  
  // ✅ PRIORITAS 2: CRITICAL - TOLAK jika dimulai dengan "BEBAN" atau "BIAYA" (anti-konflik)
  // Solusi untuk: "Beban Listrik", "Beban Perlengkapan" tidak boleh jadi ASET
  if (upperName.startsWith('BEBAN ') || upperName === 'BEBAN' || 
      upperName.startsWith('BIAYA ') || upperName === 'BIAYA') {
    console.log(`🙅 [ASSET-REJECT] "${name}" REJECTED as ASET (starts with BEBAN/BIAYA)`);
    return false;
  }
  
  // ✅ PRIORITAS 3: Validasi spesifik untuk aset yang sering salah klasifikasi
  // Solusi untuk: "Perlengkapan" harus ASET, bukan BEBAN
  const specificAssets = [
    'PERLENGKAPAN', // Khusus untuk "Perlengkapan" (bukan "Beban Perlengkapan")
    'KAS', 'KAS KECIL', 'KAS BESAR',
    'BANK BCA', 'BANK MANDIRI', 'BANK BRI', 'REKENING BANK',
    'PIUTANG USAHA', 'PIUTANG DAGANG',
    'PERSEDIAAN BARANG', 'STOK BARANG',
    'TANAH DAN BANGUNAN', 'GEDUNG KANTOR',
    'KENDARAAN OPERASIONAL', 'MOTOR DINAS',
    'PERALATAN KANTOR', 'KOMPUTER', 'PRINTER'
  ];
  
  if (specificAssets.some(asset => upperName === asset)) {
    console.log(`🎯 [ASSET-SPECIFIC] "${name}" classified as ASET (specific asset match)`);
    return true;
  }
  
  // ✅ PRIORITAS 4: Keyword umum aset (dengan validasi ketat)
  const assetKeywords = [
    'TUNAI', 'CASH', 'GIRO', 'DEPOSITO',
    'TAGIHAN', 'DEBITUR', 'BARANG DAGANGAN',
    'TANAH', 'BANGUNAN', 'GEDUNG', 'KENDARAAN', 'MESIN',
    'INVENTARIS', 'SUPPLIES',
    'DIBAYAR DIMUKA', 'MASIH HARUS DITERIMA',
    'AKUMULASI PENYUSUTAN', 'INVESTASI JANGKA PANJANG',
    'HAK PATEN', 'GOODWILL', 'LISENSI', 'ASET TAKBERWUJUD'
  ];
  
  const hasAssetKeyword = assetKeywords.some(keyword => upperName.includes(keyword));
  
  if (hasAssetKeyword) {
    // ✅ VALIDASI TAMBAHAN: Pastikan bukan beban yang kebetulan mengandung keyword
    const expenseIndicators = [
      'BEBAN ', 'BIAYA ', 'UPAH', 'GAJI', 'SEWA GEDUNG', 'LISTRIK', 'AIR'
    ];
    
    const hasExpenseIndicator = expenseIndicators.some(indicator => upperName.includes(indicator));
    
    if (!hasExpenseIndicator) {
      console.log(`🎯 [ASSET-KEYWORD] "${name}" classified as ASET (keyword match, no expense conflict)`);
      return true;
    }
  }
  
  return false;
}

/**
 * Cek apakah akun adalah LIABILITAS
 */
function isLiabilityAccount(name, code) {
  // Berdasarkan kode (2xxx untuk LIABILITAS menurut SAK EMKM)
  if (code.startsWith('2') || code.startsWith('21') || code.startsWith('22')) {
    return true;
  }
  
  // Berdasarkan nama
  const liabilityKeywords = [
    'UTANG', 'HUTANG', 'KREDIT', 'PINJAMAN', 'KREDITUR',
    'LIABILITAS', 'KEWAJIBAN', 'CICILAN',
    'BEBAN YANG MASIH HARUS DIBAYAR', 'MASIH HARUS DIBAYAR',
    'PENDAPATAN DITERIMA DIMUKA', 'DITERIMA DIMUKA',
    'OBLIGASI', 'HIPOTIK', 'HIPOTEK'
  ];
  
  return liabilityKeywords.some(keyword => name.includes(keyword));
}

/**
 * ✅ SOLUSI: Cek apakah akun adalah EKUITAS dengan validasi ketat
 */
function isEquityAccount(name, code) {
  const upperName = name.toUpperCase();
  const upperCode = code.toString();
  
  // ✅ PRIORITAS 1: Berdasarkan kode SAK EMKM (3xxx untuk EKUITAS)
  if (upperCode.startsWith('3')) {
    return true;
  }
  
  // ✅ PRIORITAS 2: Validasi nama spesifik modal/ekuitas
  // Solusi untuk: Hanya modal investasi & laba ditahan, bukan pendapatan
  const specificEquity = [
    'MODAL PEMILIK', 'MODAL SAHAM', 'MODAL DISETOR',
    'LABA DITAHAN', 'CADANGAN', 'PRIVE',
    'INVESTASI PEMILIK', 'SETORAN MODAL'
  ];
  
  if (specificEquity.some(equity => upperName.includes(equity))) {
    return true;
  }
  
  // ✅ PRIORITAS 3: Keyword ekuitas (hati-hati dengan pendapatan)
  const equityKeywords = ['MODAL', 'SAHAM', 'EKUITAS', 'CADANGAN', 'PRIVE'];
  
  const isDefinitelyEquity = equityKeywords.some(keyword => upperName.includes(keyword));
  
  // Validasi tambahan: jangan sampai pendapatan masuk ke modal
  const revenueIndicators = ['PENDAPATAN', 'PENJUALAN', 'JASA', 'KOMISI'];
  const hasRevenueIndicator = revenueIndicators.some(indicator => upperName.includes(indicator));
  
  return isDefinitelyEquity && !hasRevenueIndicator;
}

/**
 * ✅ SOLUSI: Cek apakah akun adalah PENDAPATAN dengan validasi ketat
 * Fixes: "Pendapatan Penjualan masuk ke akun Modal"
 */
function isRevenueAccount(name, code) {
  const upperName = name.toUpperCase();
  const upperCode = code.toString();
  
  // ✅ PRIORITAS 1: Berdasarkan kode SAK EMKM (4xxx untuk PENDAPATAN)
  if (upperCode.startsWith('4')) {
    console.log(`🎯 [REVENUE-CODE] "${name}" classified as PENDAPATAN (code: ${code})`);
    return true;
  }
  
  // ✅ PRIORITAS 2: CRITICAL - Validasi nama spesifik untuk pendapatan
  // Solusi untuk: "Pendapatan Penjualan" harus PENDAPATAN, bukan MODAL
  const specificRevenue = [
    'PENDAPATAN JASA', 'PENDAPATAN PENJUALAN', 'PENDAPATAN USAHA',
    'PENJUALAN BARANG', 'PENJUALAN JASA',
    'HASIL PENJUALAN', 'OMZET PENJUALAN'
  ];
  
  if (specificRevenue.some(revenue => upperName === revenue || upperName.startsWith(revenue))) {
    console.log(`🎯 [REVENUE-SPECIFIC] "${name}" classified as PENDAPATAN (specific revenue match)`);
    return true;
  }
  
  // ✅ PRIORITAS 3: Validasi nama yang dimulai dengan "PENDAPATAN" atau "PENJUALAN"
  if (upperName.startsWith('PENDAPATAN ') || upperName === 'PENDAPATAN' ||
      upperName.startsWith('PENJUALAN ') || upperName === 'PENJUALAN') {
    console.log(`🎯 [REVENUE-PREFIX] "${name}" classified as PENDAPATAN (starts with PENDAPATAN/PENJUALAN)`);
    return true;
  }
  
  // ✅ PRIORITAS 4: Keyword pendapatan yang spesifik
  const revenueKeywords = [
    'JASA KONSULTASI', 'KOMISI PENJUALAN',
    'BUNGA DITERIMA', 'DIVIDEN DITERIMA', 'ROYALTI DITERIMA',
    'SEWA DITERIMA', 'REVENUE', 'INCOME OPERASIONAL',
    'LABA PENJUALAN ASET'
  ];
  
  const hasRevenueKeyword = revenueKeywords.some(keyword => upperName.includes(keyword));
  
  if (hasRevenueKeyword) {
    // ✅ VALIDASI TAMBAHAN: Pastikan bukan modal yang kebetulan mengandung keyword
    const equityIndicators = [
      'MODAL ', 'SAHAM ', 'INVESTASI PEMILIK', 'SETORAN MODAL',
      'LABA DITAHAN', 'CADANGAN '
    ];
    
    const hasEquityIndicator = equityIndicators.some(indicator => upperName.includes(indicator));
    
    if (!hasEquityIndicator) {
      console.log(`🎯 [REVENUE-KEYWORD] "${name}" classified as PENDAPATAN (keyword match, no equity conflict)`);
      return true;
    }
  }
  
  return false;
}

/**
 * ✅ SOLUSI: Cek apakah akun adalah BEBAN dengan validasi ketat
 * Fixes: "Beban Listrik salah dicatat ke Aktiva" & "Beban Perlengkapan vs Perlengkapan"
 */
function isExpenseAccount(name, code) {
  const upperName = name.toUpperCase();
  const upperCode = code.toString();
  
  // ✅ PRIORITAS 1: Berdasarkan kode SAK EMKM (5xxx untuk BEBAN)
  if (upperCode.startsWith('5')) {
    return true;
  }
  
  // ✅ PRIORITAS 2: CRITICAL - Nama yang dimulai dengan "BEBAN" atau "BIAYA" (paling spesifik)
  // Solusi untuk: "Beban Listrik", "Beban Perlengkapan", "Beban Gaji" harus jadi BEBAN
  if (upperName.startsWith('BEBAN ') || upperName === 'BEBAN' || 
      upperName.startsWith('BIAYA ') || upperName === 'BIAYA') {
    console.log(`🎯 [EXPENSE-PRIORITY] "${name}" classified as BEBAN (starts with BEBAN/BIAYA)`);
    return true;
  }
  
  // ✅ PRIORITAS 3: Validasi spesifik untuk menghindari konflik dengan aset
  // Solusi untuk: "Perlengkapan" (ASET) vs "Beban Perlengkapan" (BEBAN)
  const specificExpenses = [
    'BEBAN GAJI', 'BEBAN LISTRIK', 'BEBAN AIR', 'BEBAN SEWA',
    'BEBAN PERLENGKAPAN', 'BEBAN TELEPON', 'BEBAN INTERNET',
    'BIAYA GAJI', 'BIAYA LISTRIK', 'BIAYA OPERASIONAL'
  ];
  
  if (specificExpenses.some(expense => upperName === expense || upperName.includes(expense))) {
    console.log(`🎯 [EXPENSE-SPECIFIC] "${name}" classified as BEBAN (specific expense match)`);
    return true;
  }
  
  // ✅ PRIORITAS 4: Keyword beban yang spesifik (lebih hati-hati)
  const expenseKeywords = [
    'UPAH', 'GAJI KARYAWAN', 'HONORARIUM',
    'HARGA POKOK', 'ONGKOS', 'TRANSPORT',
    'MAKAN MINUM', 'OPERASIONAL', 'EXPENSE',
    'ADMINISTRASI', 'MARKETING', 'PROMOSI',
    'PENYUSUTAN', 'PAJAK PENGHASILAN', 'BUNGA PINJAMAN'
  ];
  
  // Cek keyword dengan validasi tambahan
  const hasExpenseKeyword = expenseKeywords.some(keyword => upperName.includes(keyword));
  
  if (hasExpenseKeyword) {
    // ✅ VALIDASI TAMBAHAN: Pastikan bukan aset yang kebetulan mengandung keyword
    const assetIndicators = [
      'PIUTANG', 'PERSEDIAAN', 'KAS', 'BANK', 'TANAH', 'BANGUNAN',
      'PERALATAN', 'KENDARAAN', 'MESIN', 'INVENTARIS'
    ];
    
    const hasAssetIndicator = assetIndicators.some(indicator => upperName.includes(indicator));
    
    if (!hasAssetIndicator) {
      console.log(`🎯 [EXPENSE-KEYWORD] "${name}" classified as BEBAN (keyword match, no asset conflict)`);
      return true;
    }
  }
  
  return false;
}

/**
 * Menentukan subkategori untuk ASET
 */
function getAssetCategory(name) {
  if (name.includes('KAS') || name.includes('TUNAI') || name.includes('CASH')) {
    return 'KAS';
  }
  if (name.includes('BANK') || name.includes('REKENING') || name.includes('GIRO')) {
    return 'BANK';
  }
  if (name.includes('PIUTANG') || name.includes('TAGIHAN')) {
    return 'PIUTANG';
  }
  if (name.includes('PERSEDIAAN') || name.includes('STOK') || name.includes('BARANG')) {
    return 'PERSEDIAAN';
  }
  if (name.includes('PERLENGKAPAN') || name.includes('SUPPLIES')) {
    return 'PERLENGKAPAN';
  }
  return 'ASET';
}

/**
 * ✅ SOLUSI: Validasi nominal dan saldo dengan benar
 * Fixes: "Nominal kosong/nol tapi tetap disimpan" & "Saldo awal tidak diinput dengan benar"
 * @param {Object} account - Data akun
 * @param {Array} transactions - Array transaksi
 * @returns {number} - Saldo akhir yang valid
 */
export function calculateAccountBalance(account, transactions) {
  // Validasi input account
  if (!account || !account.name) {
    console.warn('⚠️ [BALANCE] Invalid account data');
    return 0;
  }
  
  const classification = classifyAccount(account.name, account.code);
  let balance = Number(account.balance || 0);
  
  // ✅ SOLUSI: Validasi saldo awal - jangan sampai NaN atau invalid
  if (isNaN(balance) || !isFinite(balance)) {
    console.warn(`⚠️ [BALANCE] Invalid initial balance for account: ${account.name}, setting to 0`);
    balance = 0;
  }
  
  // ✅ SOLUSI: Log saldo awal untuk debugging
  if (balance !== 0) {
    console.log(`📊 [BALANCE-INITIAL] ${account.name}: ${balance.toLocaleString('id-ID')}`);
  }
  
  // Validasi input transactions
  if (!Array.isArray(transactions)) {
    console.warn('⚠️ [BALANCE] Invalid transactions data');
    return balance;
  }
  
  let transactionCount = 0;
  
  transactions.forEach(transaction => {
    // ✅ SOLUSI: Validasi transaksi - skip yang invalid atau kosong
    if (!transaction || typeof transaction !== 'object') {
      return;
    }
    
    const amount = Number(transaction.amount || transaction.nominal || 0);
    
    // ✅ SOLUSI: Skip transaksi dengan nominal kosong/invalid tapi tidak error
    // "Nominal kosong/nol tapi tetap disimpan" - biarkan tersimpan tapi tidak mempengaruhi saldo
    if (!amount || amount === 0 || isNaN(amount) || !isFinite(amount)) {
      return; // Skip transaksi kosong/invalid dengan aman
    }
    
    // Jika akun di-DEBIT
    if (transaction.debit_account_id === account.id) {
      transactionCount++;
      if (classification.normalBalance === 'DEBIT') {
        balance += amount; // Normal balance DEBIT: debit menambah saldo
        console.log(`  🟢 DEBIT: +${amount.toLocaleString('id-ID')} -> ${balance.toLocaleString('id-ID')}`);
      } else {
        balance -= amount; // Normal balance CREDIT: debit mengurangi saldo
        console.log(`  🟡 DEBIT: -${amount.toLocaleString('id-ID')} -> ${balance.toLocaleString('id-ID')}`);
      }
    }
    
    // Jika akun di-KREDIT
    if (transaction.credit_account_id === account.id || transaction.creditAccountId === account.id) {
      transactionCount++;
      if (classification.normalBalance === 'DEBIT') {
        balance -= amount; // Normal balance DEBIT: kredit mengurangi saldo
        console.log(`  🔴 CREDIT: -${amount.toLocaleString('id-ID')} -> ${balance.toLocaleString('id-ID')}`);
      } else {
        balance += amount; // Normal balance CREDIT: kredit menambah saldo
        console.log(`  🟢 CREDIT: +${amount.toLocaleString('id-ID')} -> ${balance.toLocaleString('id-ID')}`);
      }
    }
  });
  
  // ✅ SOLUSI: Pastikan hasil tidak NaN atau infinite
  if (isNaN(balance) || !isFinite(balance)) {
    console.error(`❌ [BALANCE] Final balance is invalid for ${account.name}, setting to 0`);
    return 0;
  }
  
  // Log final balance untuk debugging
  if (transactionCount > 0 || balance !== 0) {
    console.log(`✅ [BALANCE-FINAL] ${account.name}: ${balance.toLocaleString('id-ID')} (${transactionCount} transactions)`);
  }
  
  return balance;
}

/**
 * ✅ SOLUSI: Validasi input transaksi sebelum disimpan
 * Fixes: "Nominal kosong/nol tapi tetap disimpan" & general input validation
 * @param {Object} transactionData - Data transaksi yang akan disimpan
 * @returns {Object} - {isValid: boolean, errors: Array, sanitizedData: Object}
 */
export function validateTransactionInput(transactionData) {
  const errors = [];
  const sanitizedData = { ...transactionData };
  
  // ✅ SOLUSI: Validasi nominal - jangan sampai kosong atau invalid
  const amount = Number(transactionData.amount || transactionData.nominal || 0);
  if (!amount || amount <= 0 || isNaN(amount) || !isFinite(amount)) {
    errors.push('Nominal transaksi harus diisi dengan nilai yang valid dan lebih dari 0');
  } else {
    sanitizedData.amount = amount;
    sanitizedData.nominal = amount; // Standardize field name
  }
  
  // ✅ SOLUSI: Validasi akun debit dan kredit
  if (!transactionData.debit_account_id && !transactionData.debitAccountId) {
    errors.push('Akun debit harus dipilih');
  }
  
  if (!transactionData.credit_account_id && !transactionData.creditAccountId) {
    errors.push('Akun kredit harus dipilih');
  }
  
  // Standardize account ID field names
  if (transactionData.debitAccountId && !transactionData.debit_account_id) {
    sanitizedData.debit_account_id = transactionData.debitAccountId;
  }
  if (transactionData.creditAccountId && !transactionData.credit_account_id) {
    sanitizedData.credit_account_id = transactionData.creditAccountId;
  }
  
  // ✅ SOLUSI: Validasi deskripsi
  if (!transactionData.description || transactionData.description.trim() === '') {
    errors.push('Deskripsi transaksi harus diisi');
  } else {
    sanitizedData.description = transactionData.description.trim();
  }
  
  // ✅ SOLUSI: Validasi tanggal
  if (!transactionData.date) {
    errors.push('Tanggal transaksi harus diisi');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    sanitizedData: sanitizedData
  };
}

/**
 * ✅ SOLUSI: Validasi saldo awal akun
 * Fixes: "Saldo awal tidak diinput dengan benar"
 * @param {Object} accountData - Data akun dengan saldo awal
 * @returns {Object} - {isValid: boolean, errors: Array, sanitizedData: Object}
 */
export function validateAccountBalance(accountData) {
  const errors = [];
  const sanitizedData = { ...accountData };
  
  // ✅ SOLUSI: Validasi nama akun
  if (!accountData.name || accountData.name.trim() === '') {
    errors.push('Nama akun harus diisi');
  } else {
    sanitizedData.name = accountData.name.trim();
  }
  
  // ✅ SOLUSI: Validasi saldo awal - boleh 0 tapi tidak boleh invalid
  const balance = Number(accountData.balance || 0);
  if (isNaN(balance) || !isFinite(balance)) {
    errors.push('Saldo awal harus berupa angka yang valid');
  } else {
    sanitizedData.balance = balance;
  }
  
  // ✅ SOLUSI: Validasi klasifikasi akun
  const classification = classifyAccount(sanitizedData.name, accountData.code);
  if (classification.type === 'LAIN') {
    errors.push(`Akun "${sanitizedData.name}" tidak dapat diklasifikasi. Pastikan nama akun sesuai standar SAK EMKM atau berikan kode akun yang tepat.`);
  }
  
  sanitizedData.classification = classification;
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    sanitizedData: sanitizedData,
    classification: classification
  };
}

/**
 * Generate kode akun sederhana untuk UKM
 * @param {string} accountType - ASET, LIABILITAS, EKUITAS, PENDAPATAN, BEBAN
 * @param {string} subCategory - Subkategori akun
 * @returns {string} - Kode akun
 */
export function generateSimpleAccountCode(accountType, subCategory = '') {
  const typePrefix = {
    'ASET': '1',
    'LIABILITAS': '2', 
    'EKUITAS': '3',
    'PENDAPATAN': '4',
    'BEBAN': '5'
  };
  
  const subPrefix = {
    // ASET
    'KAS': '11',
    'BANK': '12',
    'PIUTANG': '13',
    'PERSEDIAAN': '14',
    'ASET': '15',
    
    // LIABILITAS
    'UTANG': '21',
    
    // EKUITAS  
    'MODAL': '31',
    
    // PENDAPATAN
    'PENDAPATAN': '41',
    
    // BEBAN
    'BEBAN': '51'
  };
  
  const prefix = subPrefix[subCategory] || typePrefix[accountType] || '1';
  
  // Generate nomor urut sederhana
  const timestamp = Date.now().toString().slice(-3);
  return prefix + timestamp.slice(-2);
}