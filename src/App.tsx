import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Trash2, 
  Edit, 
  FileUp,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  Moon,
  Sun
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const socket = io();

// --- Types ---
interface LHP {
  id: string;
  noLhp: string;
  tanggal: string;
  objek: string;
  opd: string;
  kategori: string;
  fileLink: string;
  timestamp: string;
}

interface User {
  username: string;
  name: string;
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', label: 'Database', icon: FileText },
    { id: 'add', label: 'Unggah Laporan', icon: PlusCircle },
  ];

  return (
    <div className="h-screen w-64 bg-[#0f172a] dark:bg-slate-950 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-700 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">SI SULTRA</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Irban 1 2026</p>
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-4 transition-colors ${
              activeTab === item.id 
                ? 'bg-[#1e3a8a] dark:bg-blue-900 border-r-4 border-blue-400 text-white' 
                : 'text-gray-400 hover:bg-gray-800 dark:hover:bg-slate-900 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-gray-700 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ data }: { data: LHP[] }) => {
  const categories = ['Ketaatan', 'Kinerja', 'Monitoring', 'Reviu', 'Lainnya'];
  
  const stats = categories.map(cat => ({
    name: cat,
    count: data.filter(item => item.kategori === cat).length
  }));

  const opdStats = Array.from(new Set(data.map(item => item.opd))).map(opd => ({
    name: opd,
    count: data.filter(item => item.opd === opd).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const recentActivity = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Laporan</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.length}</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
        {stats.map((stat, i) => (
          <div key={stat.name} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.name}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.count}</h3>
              </div>
              <div className={`p-3 rounded-lg ${
                i === 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                i === 1 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 
                i === 2 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                i === 3 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 
                'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {i === 0 ? <CheckCircle2 className="w-6 h-6" /> : 
                 i === 1 ? <Activity className="w-6 h-6" /> : 
                 i === 2 ? <AlertCircle className="w-6 h-6" /> : 
                 i === 3 ? <BarChart3 className="w-6 h-6" /> : 
                 <PieChartIcon className="w-6 h-6" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Distribusi Kategori Pengawasan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div key={item.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors border-b border-gray-50 dark:border-slate-700 last:border-0">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.noLhp}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.objek} - {item.opd}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-medium">{new Date(item.timestamp).toLocaleString('id-ID')}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Belum ada aktivitas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top 5 OPD dengan Laporan Terbanyak</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={opdStats} layout="vertical" margin={{ left: 40, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemName: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <div className="flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              Apakah Anda yakin ingin menghapus laporan <span className="font-bold text-gray-900 dark:text-white">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditLHPModal = ({ isOpen, onClose, item, onUpdate }: { isOpen: boolean, onClose: () => void, item: LHP | null, onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    noLhp: '',
    tanggal: '',
    objek: '',
    opd: '',
    kategori: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        noLhp: item.noLhp,
        tanggal: item.tanggal,
        objek: item.objek,
        opd: item.opd,
        kategori: item.kategori
      });
      setFile(null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setLoading(true);

    const data = new FormData();
    data.append('noLhp', formData.noLhp);
    data.append('tanggal', formData.tanggal);
    data.append('objek', formData.objek);
    data.append('opd', formData.opd);
    data.append('kategori', formData.kategori);
    if (file) data.append('file', file);

    try {
      await axios.put(`/api/lhp/${item.id}`, data);
      onUpdate();
      onClose();
    } catch (error) {
      alert('Gagal memperbarui data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full overflow-hidden"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Laporan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">No Laporan</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    value={formData.noLhp}
                    onChange={(e) => setFormData({...formData, noLhp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tanggal</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Judul Laporan</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white"
                  value={formData.objek}
                  onChange={(e) => setFormData({...formData, objek: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">OPD</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white"
                  value={formData.opd}
                  onChange={(e) => setFormData({...formData, opd: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kategori</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  >
                    <option value="Ketaatan">Ketaatan</option>
                    <option value="Kinerja">Kinerja</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Reviu">Reviu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ganti File (Opsional)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const LHPList = ({ data, onDelete }: { data: LHP[], onDelete: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpd, setSelectedOpd] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean, item: LHP | null }>({
    isOpen: false,
    item: null
  });

  const uniqueOpds = Array.from(new Set(data.map(item => item.opd))).sort();
  const uniqueYears = Array.from(new Set(data.map(item => new Date(item.tanggal).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));
  const uniqueKategoris = Array.from(new Set(data.map(item => item.kategori))).sort();

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.noLhp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.opd.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOpd = selectedOpd === '' || item.opd === selectedOpd;
    const matchesYear = selectedYear === '' || new Date(item.tanggal).getFullYear().toString() === selectedYear;
    const matchesKategori = selectedKategori === '' || item.kategori === selectedKategori;

    return matchesSearch && matchesOpd && matchesYear && matchesKategori;
  });

  const exportToCSV = () => {
    const headers = ['No Laporan', 'Tanggal', 'Judul Laporan', 'OPD', 'Kategori', 'Tautan File'];
    const rows = filteredData.map(item => [
      item.noLhp,
      new Date(item.tanggal).toLocaleDateString('id-ID'),
      item.objek,
      item.opd,
      item.kategori,
      item.fileLink
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lhp_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPreviewLink = (link: string) => {
    if (link.includes('drive.google.com')) {
      const fileId = link.split('/d/')[1]?.split('/')[0];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return link;
  };

  const getDownloadLink = (link: string) => {
    if (link.includes('drive.google.com')) {
      const fileId = link.split('/d/')[1]?.split('/')[0];
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    return link;
  };

  return (
    <>
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => onDelete(deleteModal.id)}
        itemName={deleteModal.name}
      />
      <EditLHPModal 
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        item={editModal.item}
        onUpdate={() => {}} // Socket.io will handle update
      />
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Database Laporan</h3>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari No Laporan, Objek, atau OPD..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2">
              <Filter className="w-3 h-3 mr-1" />
              Filter:
            </div>
            
            <select 
              className="text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={selectedOpd}
              onChange={(e) => setSelectedOpd(e.target.value)}
            >
              <option value="">Semua OPD</option>
              {uniqueOpds.map(opd => (
                <option key={opd} value={opd}>{opd}</option>
              ))}
            </select>

            <select 
              className="text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Semua Tahun</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select 
              className="text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {uniqueKategoris.map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>

            {(selectedOpd || selectedYear || selectedKategori) && (
              <button 
                onClick={() => {
                  setSelectedOpd('');
                  setSelectedYear('');
                  setSelectedKategori('');
                }}
                className="text-xs text-red-500 font-bold hover:underline ml-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">No Laporan</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Judul Laporan</th>
              <th className="px-6 py-4">OPD</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.noLhp}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.objek}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.opd}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.kategori === 'Ketaatan' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    item.kategori === 'Kinerja' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    item.kategori === 'Monitoring' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    item.kategori === 'Reviu' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}>
                    {item.kategori}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={getPreviewLink(item.fileLink)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Lihat
                  </a>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <a 
                      href={getDownloadLink(item.fileLink)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Unduh PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => setEditModal({ isOpen: true, item })}
                      className="text-gray-500 hover:text-amber-600 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      title="Edit Data"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.noLhp })}
                      className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

const LHPForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    noLhp: '',
    tanggal: '',
    objek: '',
    opd: '',
    kategori: 'Ketaatan'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Silakan pilih file PDF terlebih dahulu' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('noLhp', formData.noLhp);
    data.append('tanggal', formData.tanggal);
    data.append('objek', formData.objek);
    data.append('opd', formData.opd);
    data.append('kategori', formData.kategori);
    data.append('file', file);

    try {
      await axios.post('/api/lhp', data);
      setMessage({ type: 'success', text: 'Laporan berhasil diunggah!' });
      setFormData({ noLhp: '', tanggal: '', objek: '', opd: '', kategori: 'Ketaatan' });
      setFile(null);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengunggah laporan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <PlusCircle className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        Unggah Laporan Baru
      </h3>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor Laporan</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
              placeholder="Contoh: 700/01/INSP/2024"
              value={formData.noLhp}
              onChange={(e) => setFormData({...formData, noLhp: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Laporan</label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
              value={formData.tanggal}
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Laporan</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
            placeholder="Nama kegiatan atau objek pemeriksaan"
            value={formData.objek}
            onChange={(e) => setFormData({...formData, objek: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">OPD / Instansi</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
            placeholder="Dinas / Badan / Biro terkait"
            value={formData.opd}
            onChange={(e) => setFormData({...formData, opd: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori Pengawasan</label>
          <select
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
            value={formData.kategori}
            onChange={(e) => setFormData({...formData, kategori: e.target.value})}
          >
            <option value="Ketaatan">Ketaatan</option>
            <option value="Kinerja">Kinerja</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Reviu">Reviu</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unggah File PDF</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer relative">
            <div className="space-y-1 text-center">
              <FileUp className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                  {file ? file.name : 'Klik untuk memilih file'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-600">PDF maksimal 10MB</p>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all ${
            loading ? 'bg-gray-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-[#1e3a8a] dark:bg-blue-600 hover:bg-[#0f172a] dark:hover:bg-blue-700 shadow-lg shadow-blue-900/20'
          }`}
        >
          {loading ? 'Sedang Mengunggah...' : 'Simpan Data Laporan'}
        </button>
      </form>
    </div>
  );
};

const Login = ({ onLogin, isDarkMode, setIsDarkMode }: { onLogin: (user: User) => void, isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (err) {
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all z-10"
        title="Ganti Tema"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10"
      >
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 relative z-10">SI SULTRA</h1>
          <p className="text-blue-100/80 text-xs uppercase tracking-[0.2em] font-bold relative z-10">Sistem Unggah Laporan Terintegrasi</p>
        </div>
        <div className="p-10">
          <div className="text-center mb-10">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
              <LayoutDashboard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Silakan masuk untuk mengelola arsip digital</p>
            <div className="mt-4 inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">Sistem Internal Inspektorat</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all pr-12 text-gray-900 dark:text-white"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Lupa password? Hubungi Administrator IT Inspektorat
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lhpData, setLhpData] = useState<LHP[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/lhp');
      setLhpData(response.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Listen for real-time updates
      socket.on('lhp:changed', () => {
        fetchData();
      });

      return () => {
        socket.off('lhp:changed');
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/lhp/${id}`);
      setLhpData(lhpData.filter(item => item.id !== id));
    } catch (error) {
      alert('Gagal menghapus data');
    }
  };

  if (!user) {
    return <Login onLogin={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setUser(null)} 
      />
      
      <main className="ml-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'dashboard' ? 'Dashboard Ringkasan' : 
               activeTab === 'list' ? 'Database' : 'Unggah Laporan Baru'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {activeTab === 'dashboard' ? 'Pantau statistik laporan secara real-time' : 
               activeTab === 'list' ? 'Kelola dan cari arsip digital laporan' : 'Pastikan file PDF sudah sesuai standar'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard data={lhpData} />}
            {activeTab === 'list' && <LHPList data={lhpData} onDelete={handleDelete} />}
            {activeTab === 'add' && <LHPForm onSuccess={() => {
              fetchData();
              setActiveTab('list');
            }} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
