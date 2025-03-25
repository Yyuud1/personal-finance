const keteranganInput = document.getElementById("keterangan");
const jumlahInput = document.getElementById("jumlah");
const tipeInput = document.getElementById("tipe");
const tambahBtn = document.getElementById("tambahBtn");
const listTransaksi = document.getElementById("listTransaksi");
const totalPemasukan = document.getElementById("totalPemasukan");
const totalPengeluaran = document.getElementById("totalPengeluaran");
const saldo = document.getElementById("saldo");
const searchInput = document.getElementById("search");
const filterBulan = document.getElementById("filterBulan");
const exportPdf = document.getElementById("exportPDF");

let dataTransaksi = JSON.parse(localStorage.getItem("keuangan")) || [];

function simpanData() {
  localStorage.setItem("keuangan", JSON.stringify(dataTransaksi));
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(angka);
}

function updateRekap() {
  let pemasukan = 0;
  let pengeluaran = 0;

  dataTransaksi.forEach((item) => {
    if (item.tipe === "pemasukan") {
      pemasukan += item.jumlah;
    } else {
      pengeluaran += item.jumlah;
    }
  });

  totalPemasukan.textContent = `${formatRupiah(pemasukan)}
  `;
  totalPengeluaran.textContent = `${formatRupiah(pengeluaran)}`;
  saldo.textContent = `${formatRupiah(pemasukan - pengeluaran)}`;

  feather.replace();
}

function formatTanggal(tanggal) {
  const dateObj = new Date(tanggal);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderList(filteredData = dataTransaksi) {
  const tbody = listTransaksi.querySelector("tbody");
  tbody.innerHTML = "";

  filteredData.forEach((item, index) => {
    const tipe = String(item.tipe).toUpperCase();
    const warnaTipe =
      tipe === "PEMASUKAN" ? "var(--color-green)" : "var(--color-red)";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatTanggal(item.tanggal)}</td>
      <td>${item.keterangan}</td>
      <td class="${item.tipe}">Rp ${item.jumlah.toLocaleString("id-ID")}</td>
      <td style="color: ${warnaTipe};">${tipe}</td>
      <td class="aksi">
        <button class="edit" data-index="${index}">
          <i data-feather="edit"></i>
        </button>
        <button class="hapus" data-index="${index}">
          <i data-feather="trash-2"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  feather.replace();
  updateRekap();
  updateFilterBulanOptions();
}

function updateFilterBulanOptions() {
  const bulanSet = new Set();
  dataTransaksi.forEach((item) => {
    const bulan = item.tanggal.slice(0, 7);
    bulanSet.add(bulan);
  });

  filterBulan.innerHTML = `<option value="all">Semua Bulan</option>`;
  [...bulanSet].sort().forEach((bulan) => {
    filterBulan.innerHTML += `<option value="${bulan}">${bulan}</option>`;
  });
}

jumlahInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value) {
    value = new Intl.NumberFormat("id-ID").format(value);
  }
  e.target.value = value;
});

tambahBtn.addEventListener("click", () => {
  const keterangan = keteranganInput.value.trim();
  const jumlah = parseFloat(jumlahInput.value.replace(/\./g, "").trim());
  const tipe = tipeInput.value;
  const tanggal = new Date().toISOString().slice(0, 10);

  if (!keterangan || isNaN(jumlah) || jumlah <= 0) {
    Swal.fire({
      toast: "true",
      icon: "error",
      confirmButtonColor: "var(--color-bluesoft)",
      position: "top-end",
      title: "Oops...",
      text: "Harap isi form sebelum klik tambah",
    });
    return;
  }

  dataTransaksi.push({ keterangan, jumlah, tipe, tanggal });
  simpanData();
  renderList();
  keteranganInput.value = "";
  jumlahInput.value = "";

  Swal.fire({
    toast: "true",
    icon: "success",
    position: "top-end",
    title: "Transaksi Ditambahkan",
    showConfirmButton: false,
    timer: 1500,
  });
});

listTransaksi.addEventListener("click", (e) => {
  const index = e.target.closest("button")?.dataset.index;
  if (!index) return;

  if (e.target.closest("button").classList.contains("hapus")) {
    Swal.fire({
      toast: "true",
      title: "Yakin ingin menghapus?",
      position: "top-end",
      text: "Data ini akan hilang selamanya!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-red)",
      cancelButtonColor: "var(--color-bluesoft)",
      confirmButtonText: "Ya, hapus!",
    }).then((result) => {
      if (result.isConfirmed) {
        dataTransaksi.splice(index, 1);
        simpanData();
        renderList();
        Swal.fire({
          toast: "true",
          position: "top-end",
          icon: "success",
          title: "Terhapus!",
          text: "Transaksi telah dihapus.",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  } else if (e.target.closest("button").classList.contains("edit")) {
    const item = dataTransaksi[index];

    Swal.fire({
      toast: "true",
      position: "top-end",
      title: "Edit Transaksi",
      html: ` <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
          <label for="edit-keterangan">Keterangan:</label>
          <div style="position: relative;">
            <input id="edit-keterangan" class="swal2-input" type="text" value="${
              item.keterangan
            }" style="padding-left: 30px;">
            <i data-feather="file-text" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"></i>
          </div>

          <label for="edit-jumlah">Jumlah:</label>
          <div style="position: relative;">
            <input id="edit-jumlah" class="swal2-input" type="number" value="${
              item.jumlah
            }" style="padding-left: 30px;">
            <i data-feather="dollar-sign" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"></i>
          </div>

          <label for="edit-tipe">Tipe:</label>
          <div style="position: relative;">
            <select id="edit-tipe" class="swal2-select">
              <option value="pemasukan" ${
                item.tipe === "pemasukan" ? "selected" : ""
              }>Pemasukan</option>
              <option value="pengeluaran" ${
                item.tipe === "pengeluaran" ? "selected" : ""
              }>Pengeluaran</option>
            </select>
            <i data-feather="shuffle" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"></i>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "var(--color-bluesoft)",
      cancelButtonColor: "var(--color-red)",
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        return {
          keterangan: document.getElementById("edit-keterangan").value.trim(),
          jumlah: parseFloat(
            document.getElementById("edit-jumlah").value.trim()
          ),
          tipe: document.getElementById("edit-tipe").value,
        };
      },
      didOpen: () => {
        feather.replace();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (
          !result.value.keterangan ||
          isNaN(result.value.jumlah) ||
          result.value.jumlah <= 0
        ) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            confirmButtonColor: "var(--color-bluesoft)",
            text: "Harap isi semua form dengan benar!",
          });
          return;
        }

        dataTransaksi[index] = {
          ...dataTransaksi[index],
          keterangan: result.value.keterangan,
          jumlah: result.value.jumlah,
          tipe: result.value.tipe,
        };

        simpanData();
        renderList();

        Swal.fire({
          toast: "true",
          position: "top-end",
          icon: "success",
          title: "Transaksi Diperbarui!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
});

searchInput.addEventListener("input", filterDanCari);
filterBulan.addEventListener("change", filterDanCari);

function filterDanCari() {
  const keyword = searchInput.value.toLowerCase();
  const bulan = filterBulan.value;

  const hasil = dataTransaksi.filter((item) => {
    const cocokKata =
      item.keterangan.toLowerCase().includes(keyword) ||
      item.tipe.toLowerCase().includes(keyword);
    const cocokBulan = bulan === "all" || item.tanggal.slice(0, 7) === bulan;
    return cocokKata && cocokBulan;
  });

  renderList(hasil);
}

document.getElementById("exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Laporan Keuangan", 14, 15);

  const headers = [["Tanggal", "Keterangan", "Jumlah", "Tipe"]];
  const rows = dataTransaksi.map((item) => [
    item.tanggal,
    item.keterangan,
    formatRupiah(item.jumlah),
    item.tipe,
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 20,
    theme: "grid",
  });

  const waktu = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan-Keuangan-${waktu}.pdf`);
});

renderList();
