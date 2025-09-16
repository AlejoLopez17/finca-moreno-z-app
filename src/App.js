

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Search, Menu, X, Save, FileText, Users, Activity, Home, LogOut, UserPlus, LogIn, Shield, Trash2 } from 'lucide-react';

// Importa los servicios de Firebase desde tu archivo de configuración
import { auth, db, storage } from './firebase'; 
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, writeBatch, where, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- CONFIGURACIÓN DE ADMINISTRADOR ---
// TODO: Añade aquí los correos de los usuarios que serán administradores.
const ADMIN_EMAILS = ["admin@example.com", "alezvalopz@gmail.com"];


// --- Pantalla de Autenticación (Login y Registro) ---
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const usersCollectionRef = collection(db, 'users_public_info');
        await addDoc(usersCollectionRef, {
            uid: userCredential.user.uid,
            email: userCredential.user.email
        });
      }
    } catch (err) {
      setError("Error: " + err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6"><img src="http://googleusercontent.com/file_content/2" alt="Logo" className="h-20 w-20" /></div>
        <h2 className="text-3xl font-bold text-center text-emerald-800 mb-2">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        <p className="text-center text-stone-500 mb-8">Bienvenido a Finca Moreno Z</p>
        <form onSubmit={handleAuth}>
          <div className="mb-4"><label className="block text-stone-700 font-medium mb-2">Correo Electrónico</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-lg" required /></div>
          <div className="mb-6"><label className="block text-stone-700 font-medium mb-2">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-lg" required /></div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">{isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}{isLogin ? 'Ingresar' : 'Registrarse'}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 hover:underline">{isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}</button></div>
      </div>
    </div>
  );
};


// --- Componentes de la UI (Reutilizados) ---
const Modal = ({ children, onClose, title }) => (<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4"><div className="flex justify-between items-center p-4 border-b border-stone-200"><h3 className="text-xl font-bold text-emerald-800">{title}</h3><button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={24} /></button></div><div className="p-6">{children}</div></div></div>);
const Header = ({ title, onMenuClick }) => {
  const handleLogout = () => { signOut(auth); };
  return (<header className="bg-emerald-800 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40"><div className="flex items-center"><button onClick={onMenuClick} className="mr-4 p-2 rounded-full hover:bg-emerald-700"><Menu size={24} /></button><img src="http://googleusercontent.com/file_content/2" alt="Logo" className="h-10 w-10 rounded-full bg-white p-1 object-contain" /><h1 className="text-2xl font-bold ml-4 tracking-wider">{title}</h1></div><button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-700 font-semibold"><LogOut size={18} /> Salir</button></header>);
};
const SideMenu = ({ isOpen, onClose, navigate, isAdmin }) => {
    const menuItems = [
        { name: 'Inicio', page: 'home', icon: <Home size={20} />, adminOnly: false },
        { name: 'Registrar Res', page: 'registerCattle', icon: <Plus size={20} />, adminOnly: false },
        { name: 'Actualizar Res', page: 'updateCattle', icon: <Edit size={20} />, adminOnly: false },
        { name: 'Consultar', page: 'consult', icon: <FileText size={20} />, adminOnly: false },
        { name: 'Actividades', page: 'activities', icon: <Activity size={20} />, adminOnly: false },
        { name: 'Propietarios', page: 'registerOwner', icon: <Users size={20} />, adminOnly: false },
        { name: 'Panel de Admin', page: 'admin', icon: <Shield size={20} />, adminOnly: true },
    ];
    return (<><div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div><div className={`fixed top-0 left-0 h-full bg-white w-72 shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-emerald-800">Menú</h2><button onClick={onClose} className="text-stone-500 hover:text-stone-800"><X size={24} /></button></div><nav className="p-4"><ul>{menuItems.map(item => ((!item.adminOnly || isAdmin) && <li key={item.page}><button onClick={() => { navigate(item.page); onClose(); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-all">{item.icon}{item.name}</button></li>))}</ul></nav></div></>);
};

// --- Lógica de Negocio ---
const calculateAgeInMonths = (birthDate) => { if (!birthDate) return 0; const today = new Date(); const birth = new Date(birthDate); let months = (today.getFullYear() - birth.getFullYear()) * 12; months -= birth.getMonth(); months += today.getMonth(); return months <= 0 ? 0 : months; };
const determineCattleType = (cattle) => { if (!cattle || !cattle.birthDate || !cattle.gender) return 'N/A'; const ageInMonths = calculateAgeInMonths(cattle.birthDate); if (ageInMonths <= 12) return 'Ternero/a'; if (cattle.gender === 'Hembra') { if (cattle.offspring && cattle.offspring.length > 0) { const lastParto = new Date(Math.max(...cattle.offspring.map(o => new Date(o.birthDate)))); const monthsSinceParto = calculateAgeInMonths(lastParto); return monthsSinceParto <= 12 ? 'Vaca Parida' : 'Vaca Horra'; } return ageInMonths <= 24 ? 'Novilla' : 'Vaca'; } if (cattle.gender === 'Macho') { if (ageInMonths <= 24) return 'Levante'; if (cattle.isCastrated === true) return 'Macho de Engorde'; if (cattle.isCastrated === false) return 'Toro'; return 'Macho Adulto'; } return 'Desconocido'; };


// --- Pantallas de la Aplicación ---
const HomeScreen = ({ navigate }) => { return (<div className="grid grid-cols-2 gap-6 p-6">{[{ label: 'Registro de Res', page: 'registerCattle', icon: <Plus className="w-12 h-12" /> },{ label: 'Actualización de Res', page: 'updateCattle', icon: <Edit className="w-12 h-12" /> },{ label: 'Consultar', page: 'consult', icon: <FileText className="w-12 h-12" /> },{ label: 'Registro de Actividades', page: 'activities', icon: <Activity className="w-12 h-12" /> },{ label: 'Registrar Propietarios', page: 'registerOwner', icon: <Users className="w-12 h-12" /> }].map((btn) => (<button key={btn.page} onClick={() => navigate(btn.page)} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center text-emerald-800 hover:bg-emerald-50 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 aspect-square border-b-4 border-amber-400">{btn.icon}<span className="mt-4 font-semibold text-lg">{btn.label}</span></button>))}</div>);};
const RegisterOwnerScreen = ({ onCancel, owners, user }) => { const [name, setName] = useState(''); const handleSave = async () => { if (name.trim() && user) { try { await addDoc(collection(db, 'users', user.uid, 'owners'), { name: name.trim() }); alert('Propietario guardado!'); onCancel(); } catch (error) { console.error("Error: ", error); alert("Error al guardar."); } } }; return (<div className="p-6"><div className="bg-white p-8 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Registrar Nuevo Propietario</h2><div className="mb-6"><label className="block text-stone-700 font-medium mb-2">Nombre y Apellidos</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-lg" /></div><div className="flex justify-end gap-4"><button onClick={onCancel} className="px-6 py-3 rounded-lg bg-stone-200 text-stone-700 font-semibold">Cancelar</button><button onClick={handleSave} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-2"><Save size={18}/> Guardar</button></div></div><div className="mt-8 bg-white p-8 rounded-2xl shadow-lg"><h3 className="text-xl font-bold text-emerald-800 mb-4">Propietarios Registrados</h3>{owners.length > 0 ? (<ul className="divide-y divide-stone-200">{owners.map(owner => <li key={owner.docId} className="py-3 text-stone-600">{owner.name}</li>)}</ul>) : (<p className="text-stone-500">No hay propietarios registrados.</p>)}</div></div>);};
const RegisterCattleScreen = ({ onCancel, owners, cattleData, user, targetUserUid }) => {
    const [form, setForm] = useState({ id: '', birthDate: '', gender: 'Hembra', weight: '', parentsId: '', lastVaccines: '', ownerId: owners.length > 0 ? owners[0].docId : '' });
    const [useAutoId, setUseAutoId] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const cattleType = useMemo(() => determineCattleType(form), [form.birthDate, form.gender]);
    const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
    const handlePhotoChange = (e) => { if (e.target.files.length > 0 && photos.length < 3) { setPhotos(prev => [...prev, ...Array.from(e.target.files).slice(0, 3 - prev.length)]); }};
    const generateAutoId = () => { const allIds = cattleData.map(c => c.customId.replace(/^[VM]-/, '')).filter(id => id.startsWith('FMZ-')); const lastIdNum = allIds.length > 0 ? Math.max(...allIds.map(id => parseInt(id.split('-')[1]))) : 0; return `FMZ-${String(lastIdNum + 1).padStart(3, '0')}`; };
    const handleSave = async () => {
        const finalId = useAutoId ? generateAutoId() : form.id.trim();
        if (!finalId || !form.birthDate || !form.weight || !form.ownerId) { alert("Campos obligatorios incompletos."); return; }
        if (!useAutoId && cattleData.some(c => c.customId.toUpperCase() === finalId.toUpperCase())) { alert("El código ya existe."); return; }
        const userIdToSave = targetUserUid || user.uid;
        if (!userIdToSave) { alert("No se pudo identificar al usuario."); return; }
        setIsUploading(true);
        try {
            const photoURLs = [];
            for (const photo of photos) {
                const photoRef = ref(storage, `cattle-photos/${userIdToSave}/${finalId}/${photo.name}`);
                await uploadBytes(photoRef, photo);
                const url = await getDownloadURL(photoRef);
                photoURLs.push(url);
            }
            await addDoc(collection(db, 'users', userIdToSave, 'cattle'), { ...form, customId: finalId, status: 'Viva', offspring: [], weight: parseFloat(form.weight), createdAt: serverTimestamp(), photoURLs });
            alert('Res guardada con éxito!');
            onCancel();
        } catch (error) { console.error("Error: ", error); alert("Error al guardar."); }
        finally { setIsUploading(false); }
    };
    return (
        <div className="p-6"><div className="bg-white p-8 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Registrar Nueva Res</h2><div className="mb-4"><label className="block text-stone-700 font-medium mb-2">Fotos (máx. 3)</label><div className="flex gap-4 items-center"><input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="text-sm" disabled={photos.length >= 3} /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-stone-700 font-medium mb-2">Código</label><div className="flex items-center gap-2"><input type="text" name="id" value={useAutoId ? generateAutoId() : form.id} onChange={handleChange} disabled={useAutoId} className="w-full px-4 py-3 border rounded-lg disabled:bg-stone-100" /><button onClick={() => setUseAutoId(!useAutoId)} className={`px-4 py-3 rounded-lg font-semibold ${useAutoId ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Auto</button></div></div><div><label className="block text-stone-700 font-medium mb-2">Nacimiento</label><input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div><div><label className="block text-stone-700 font-medium mb-2">Género</label><select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-white"><option value="Hembra">Hembra</option><option value="Macho">Macho</option></select></div><div><label className="block text-stone-700 font-medium mb-2">Peso (Kg)</label><input type="number" name="weight" value={form.weight} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div><div><label className="block text-stone-700 font-medium mb-2">Padres</label><input type="text" name="parentsId" value={form.parentsId} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div><div><label className="block text-stone-700 font-medium mb-2">Tipo</label><input type="text" value={cattleType} disabled className="w-full px-4 py-3 border rounded-lg bg-stone-100" /></div><div className="md:col-span-2"><label className="block text-stone-700 font-medium mb-2">Vacunas</label><input type="text" name="lastVaccines" value={form.lastVaccines} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div><div className="md:col-span-2"><label className="block text-stone-700 font-medium mb-2">Propietario</label><select name="ownerId" value={form.ownerId} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-white" disabled={owners.length === 0}>{owners.length > 0 ? owners.map(o => <option key={o.docId} value={o.docId}>{o.name}</option>) : <option>Registre un propietario</option>}</select></div></div><div className="flex justify-end gap-4 mt-8"><button onClick={onCancel} className="px-6 py-3 rounded-lg bg-stone-200" disabled={isUploading}>Cancelar</button><button onClick={handleSave} className="px-6 py-3 rounded-lg bg-emerald-600 text-white flex items-center gap-2" disabled={isUploading}>{isUploading ? 'Guardando...' : <><Save size={18}/> Guardar</>}</button></div></div></div>
    );
};
const UpdateCattleScreen = ({ onCancel, owners, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCattle, setSelectedCattle] = useState(null);
    const [form, setForm] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: '', data: null });

    const handleSearch = async () => {
        const q = query(collection(db, 'users', user.uid, 'cattle'), where("customId", "==", searchTerm.trim().toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const foundCattle = { ...doc.data(), docId: doc.id };
            setSelectedCattle(foundCattle);
            setForm(foundCattle);
        } else { alert("Código inexistente"); setSelectedCattle(null); setForm(null); }
    };

    const handleUpdate = async () => {
        if (window.confirm("¿Seguro que deseas actualizar los datos?")) {
            const cattleDocRef = doc(db, 'users', user.uid, 'cattle', selectedCattle.docId);
            await updateDoc(cattleDocRef, form);
            alert("Información actualizada con éxito");
            onCancel();
        }
    };

    const handleStatusChange = async (newStatus, date) => {
        if (!date) { alert("Por favor, selecciona una fecha."); return; }
        const batch = writeBatch(db);
        const oldDocRef = doc(db, 'users', user.uid, 'cattle', selectedCattle.docId);
        const newDocRef = doc(collection(db, 'users', user.uid, 'deceasedSoldCattle'));
        const newCustomId = `${newStatus === 'Vendida' ? 'V' : 'M'}-${selectedCattle.customId}`;
        const updatedData = { ...selectedCattle, ...form, status: newStatus, statusChangeDate: date, customId: newCustomId, originalDocId: selectedCattle.docId };
        delete updatedData.docId;
        batch.set(newDocRef, updatedData);
        batch.delete(oldDocRef);
        await batch.commit();
        alert(`Estado actualizado a ${newStatus}.`);
        onCancel();
    };

    const handleAddOffspring = async (calfId, birthDate) => {
        if (!calfId || !birthDate) { alert("Completa los datos de la cría."); return; }
        const updatedOffspring = [...(form.offspring || []), { calfId, birthDate }];
        setForm(prev => ({ ...prev, offspring: updatedOffspring }));
        setModal({ isOpen: false });
    };

    const handleChange = (e) => setForm(prev => ({...prev, [e.target.name]: e.target.value}));

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Actualizar Res</h2><div className="flex gap-2"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por código..." className="w-full px-4 py-3 border rounded-lg" /><button onClick={handleSearch} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold"><Search size={18}/></button></div></div>
            {selectedCattle && form && (
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-stone-800 mb-4">Editando: {form.customId}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-stone-700 font-medium">Peso (Kg)</label><input type="number" name="weight" value={form.weight} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div>
                        <div><label className="block text-stone-700 font-medium">Propietario</label><select name="ownerId" value={form.ownerId} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-white">{owners.map(o => <option key={o.docId} value={o.docId}>{o.name}</option>)}</select></div>
                        {form.gender === 'Hembra' && <div><label className="block text-stone-700 font-medium">Crías ({form.offspring?.length || 0})</label><button onClick={() => setModal({isOpen: true, type: 'addOffspring'})} className="w-full px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold">Añadir Cría</button></div>}
                        {form.gender === 'Macho' && calculateAgeInMonths(form.birthDate) > 24 && <div><label className="block text-stone-700 font-medium">Castración</label><div className="flex gap-2"><button onClick={() => setForm(p=>({...p, isCastrated: true}))} className={`w-full py-2 rounded-lg ${form.isCastrated === true ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Capado</button><button onClick={() => setForm(p=>({...p, isCastrated: false}))} className={`w-full py-2 rounded-lg ${form.isCastrated === false ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Sin Capar</button></div></div>}
                        <div className="md:col-span-2"><label className="block text-stone-700 font-medium">Estado</label><select value={form.status} onChange={(e) => e.target.value !== 'Viva' ? setModal({isOpen: true, type: 'changeStatus', data: {newStatus: e.target.value}}) : setForm(p=>({...p, status: 'Viva'}))} className="w-full px-4 py-3 border rounded-lg bg-white"><option>Viva</option><option>Vendida</option><option>Muerta</option></select></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8"><button onClick={onCancel} className="px-6 py-3 rounded-lg bg-stone-200">Cancelar</button><button onClick={handleUpdate} className="px-6 py-3 rounded-lg bg-emerald-600 text-white">Actualizar</button></div>
                </div>
            )}
            {modal.isOpen && modal.type === 'changeStatus' && (<Modal onClose={() => setModal({isOpen: false})} title={`Cambiar Estado a ${modal.data.newStatus}`}><p className="mb-4">Se requiere la fecha.</p><div><label>Fecha</label><input type="date" id="statusDate" className="w-full px-4 py-2 border rounded-lg" /></div><p className="text-red-600 font-medium mt-4">¡Atención! Esta acción es irreversible.</p><div className="flex justify-end gap-4 mt-6"><button onClick={() => setModal({isOpen: false})} className="px-6 py-2 rounded-lg bg-stone-200">Cancelar</button><button onClick={() => handleStatusChange(modal.data.newStatus, document.getElementById('statusDate').value)} className="px-6 py-2 rounded-lg bg-red-600 text-white">Confirmar</button></div></Modal>)}
            {modal.isOpen && modal.type === 'addOffspring' && (<Modal onClose={() => setModal({isOpen: false})} title="Añadir Cría"><div className="space-y-4"><div><label>Código de la Cría</label><input type="text" id="calfId" className="w-full px-4 py-2 border rounded-lg" /></div><div><label>Fecha de Parto</label><input type="date" id="calfBirthDate" className="w-full px-4 py-2 border rounded-lg" /></div></div><div className="flex justify-end gap-4 mt-6"><button onClick={() => setModal({isOpen: false})} className="px-6 py-2 rounded-lg bg-stone-200">Cancelar</button><button onClick={() => handleAddOffspring(document.getElementById('calfId').value, document.getElementById('calfBirthDate').value)} className="px-6 py-2 rounded-lg bg-sky-500 text-white">Guardar</button></div></Modal>)}
        </div>
    );
};
const ConsultScreen = ({ cattleData, owners, deceasedSoldData }) => { const [view, setView] = useState('menu'); const [selectedOwner, setSelectedOwner] = useState(null); const [detailsModal, setDetailsModal] = useState({ isOpen: false, cattle: null }); const CattleCard = ({ cattle, onClick }) => { const owner = owners.find(o => o.docId === cattle.ownerId); return (<div onClick={() => onClick(cattle)} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-amber-400"><div className="flex justify-between items-start"><div><p className="font-bold text-lg text-stone-800">{cattle.customId}</p><p className="text-stone-600">{determineCattleType(cattle)}</p></div><div className={`px-3 py-1 rounded-full text-sm font-semibold ${cattle.status === 'Viva' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{cattle.status}</div></div><div className="mt-3 pt-3 border-t"><p className="text-sm text-stone-500">Propietario: <span className="font-medium text-stone-700">{owner ? owner.name : 'N/A'}</span></p></div></div>); }; const renderContent = () => { switch (view) { case 'byOwner': if (!selectedOwner) { return (<div><button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Selecciona un Propietario</h3><div className="space-y-2">{owners.map(o => <button key={o.docId} onClick={() => setSelectedOwner(o)} className="w-full text-left p-4 bg-stone-100 rounded-lg hover:bg-emerald-50">{o.name}</button>)}</div></div>); } const ownerCattle = cattleData.filter(c => c.ownerId === selectedOwner.docId); return (<div><button onClick={() => setSelectedOwner(null)} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Reses de {selectedOwner.name}</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{ownerCattle.length > 0 ? ownerCattle.map(c => <CattleCard key={c.docId} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />) : <p>Este propietario no tiene reses.</p>}</div></div>); case 'all': return (<div><button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Listado de Reses Vivas</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{cattleData.map(c => <CattleCard key={c.docId} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />)}</div></div>); case 'deceasedSold': return (<div><button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Listado de Reses Vendidas o Muertas</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{deceasedSoldData.map(c => <CattleCard key={c.docId} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />)}</div></div>); default: return (<div className="space-y-4"><button onClick={() => setView('byOwner')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Por Propietarios</button><button onClick={() => setView('all')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Reses Vivas</button><button onClick={() => setView('deceasedSold')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Muertas/Vendidas</button></div>); } }; return (<div className="p-6"><div className="bg-white p-8 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Consultar Registros</h2>{renderContent()}</div>{detailsModal.isOpen && detailsModal.cattle && (<Modal onClose={() => setDetailsModal({ isOpen: false })} title={`Detalles de ${detailsModal.cattle.customId}`}><div className="space-y-3">{detailsModal.cattle.photoURLs && detailsModal.cattle.photoURLs.length > 0 && <div className="flex gap-2">{detailsModal.cattle.photoURLs.map(url => <img key={url} src={url} alt="foto" className="w-24 h-24 object-cover rounded-md" />)}</div>}{Object.entries(detailsModal.cattle).map(([key, value]) => {if (['docId', 'createdAt', 'originalDocId', 'photoURLs'].includes(key)) return null; return (<div key={key} className="flex justify-between"><span className="font-medium text-stone-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span><span className="text-stone-800">{String(value)}</span></div>);})}<div className="flex justify-between"><span className="font-medium text-stone-600">Tipo:</span><span className="text-stone-800">{determineCattleType(detailsModal.cattle)}</span></div></div><div className="flex justify-end mt-6"><button onClick={() => setDetailsModal({isOpen: false})} className="px-6 py-2 rounded-lg bg-emerald-600 text-white">Cerrar</button></div></Modal>)}</div>);};
const RegisterActivitiesScreen = ({ onCancel, activities, user }) => { const [view, setView] = useState('menu'); const [form, setForm] = useState({ date: '', status: 'En curso', observations: '' }); const handleSave = async () => { if (form.date && form.observations && user) { try { await addDoc(collection(db, 'users', user.uid, 'activities'), { ...form, createdAt: new Date() }); alert('Actividad guardada!'); setForm({ date: '', status: 'En curso', observations: '' }); setView('consult'); } catch (error) { console.error("Error: ", error); alert("Error al guardar."); } } }; const sortedActivities = useMemo(() => [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)), [activities]); return (<div className="p-6"><div className="bg-white p-8 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Gestión de Actividades</h2>{view === 'menu' ? (<div className="flex flex-col md:flex-row gap-4"><button onClick={() => setView('add')} className="w-full p-6 bg-white rounded-lg shadow-md text-center text-lg font-semibold hover:bg-emerald-50">Agregar</button><button onClick={() => setView('consult')} className="w-full p-6 bg-white rounded-lg shadow-md text-center text-lg font-semibold hover:bg-emerald-50">Consultar</button></div>) : view === 'add' ? (<div><button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Agregar Actividad</h3><div className="space-y-4"><div><label>Fecha</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div><div><label>Estado</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white"><option>En curso</option><option>Completada</option></select></div><div><label>Observaciones</label><textarea value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} rows="4" className="w-full px-4 py-2 border rounded-lg"></textarea></div><div className="flex justify-end"><button onClick={handleSave} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold">Guardar</button></div></div></div>) : (<div><button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button><h3 className="text-xl font-bold mb-4">Registro de Actividades</h3><div className="space-y-3">{sortedActivities.map(act => (<div key={act.docId} className="p-4 bg-stone-50 rounded-lg border"><div className="flex justify-between items-center"><p className="font-semibold">{act.date}</p><span className={`px-2 py-1 text-xs font-bold rounded-full ${act.status === 'Completada' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{act.status}</span></div><p className="mt-2 text-stone-600">{act.observations}</p></div>))}</div></div>)}</div></div>);};
const AdminPanel = ({ onCancel, user }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userData, setUserData] = useState({ owners: [], cattle: [] });
    const [view, setView] = useState('main');

    useEffect(() => {
        const q = query(collection(db, 'users_public_info'));
        const unsub = onSnapshot(q, (snapshot) => { setAllUsers(snapshot.docs.map(d => ({...d.data(), docId: d.id }))); });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const unsubOwners = onSnapshot(collection(db, 'users', selectedUser.uid, 'owners'), (snapshot) => { setUserData(prev => ({...prev, owners: snapshot.docs.map(d => ({...d.data(), docId: d.id })) })); });
            const unsubCattle = onSnapshot(collection(db, 'users', selectedUser.uid, 'cattle'), (snapshot) => { setUserData(prev => ({...prev, cattle: snapshot.docs.map(d => ({...d.data(), docId: d.id })) })); });
            return () => { unsubOwners(); unsubCattle(); };
        }
    }, [selectedUser]);

    const handleDelete = async (collectionName, docId) => {
        if(window.confirm("¿Seguro que deseas eliminar este registro?")) {
            await deleteDoc(doc(db, 'users', selectedUser.uid, collectionName, docId));
            alert("Registro eliminado.");
        }
    };
    
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        if (window.confirm(`¿Estás SEGURO de que deseas eliminar al usuario ${selectedUser.email}? Esta acción NO se puede deshacer y borrará su información pública.`)) {
            // Eliminar la información pública del usuario
            await deleteDoc(doc(db, 'users_public_info', selectedUser.docId));
            alert(`Usuario ${selectedUser.email} eliminado.`);
            setSelectedUser(null);
            // NOTA IMPORTANTE: Esto solo elimina la referencia pública.
            // Para eliminar el usuario de Authentication y todos sus datos anidados (reses, propietarios, etc.),
            // se necesita una Cloud Function de Firebase. La eliminación desde el cliente es limitada por seguridad.
        }
    };

    if (view === 'registerCattle') { return <RegisterCattleScreen onCancel={() => setView('main')} owners={userData.owners} cattleData={userData.cattle} user={user} targetUserUid={selectedUser.uid} />; }

    return (
        <div className="p-6"><div className="bg-white p-8 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-emerald-800 mb-6">Panel de Administrador</h2><div className="mb-4"><label className="block text-stone-700 font-medium mb-2">Seleccionar Usuario</label><select onChange={(e) => setSelectedUser(allUsers.find(u => u.uid === e.target.value))} className="w-full p-2 border rounded"><option value="">-- Elija un usuario --</option>{allUsers.map(u => <option key={u.uid} value={u.uid}>{u.email}</option>)}</select></div>
        {selectedUser && (
            <div>
                <div className="flex gap-4 my-4">
                    <button onClick={() => setView('registerCattle')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Registrar Res para Usuario</button>
                    <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar Usuario</button>
                </div>
                <div><h3 className="text-xl font-bold mt-6 mb-2">Propietarios</h3>{userData.owners.map(o => <div key={o.docId} className="flex justify-between items-center p-2 border-b">{o.name} <button onClick={() => handleDelete('owners', o.docId)} className="text-red-500"><Trash2 size={18}/></button></div>)}</div>
                <div><h3 className="text-xl font-bold mt-6 mb-2">Reses</h3>{userData.cattle.map(c => <div key={c.docId} className="flex justify-between items-center p-2 border-b">{c.customId} - {c.gender} <button onClick={() => handleDelete('cattle', c.docId)} className="text-red-500"><Trash2 size={18}/></button></div>)}</div>
            </div>
        )}
        </div></div>
    );
};


// --- Componente Principal de la App ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [owners, setOwners] = useState([]);
    const [cattleData, setCattleData] = useState([]);
    const [deceasedSoldData, setDeceasedSoldData] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email) : false);
            setLoading(false);
            if(currentUser) { setCurrentPage('home'); }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const collections = ['owners', 'cattle', 'deceasedSoldCattle', 'activities'];
            const setters = [setOwners, setCattleData, setDeceasedSoldData, setActivities];
            const unsubscribes = collections.map((col, index) => {
                const q = query(collection(db, 'users', user.uid, col));
                return onSnapshot(q, (snapshot) => { setters[index](snapshot.docs.map(d => ({ ...d.data(), docId: d.id }))); });
            });
            return () => unsubscribes.forEach(unsub => unsub());
        } else {
            setOwners([]); setCattleData([]); setDeceasedSoldData([]); setActivities([]);
        }
    }, [user]);

    if (loading) { return <div className="flex justify-center items-center h-screen">Cargando...</div>; }
    if (!user) { return <AuthScreen />; }

    const renderPage = () => {
        switch (currentPage) {
            case 'registerOwner': return <RegisterOwnerScreen onCancel={() => setCurrentPage('home')} owners={owners} user={user} />;
            case 'registerCattle': return <RegisterCattleScreen onCancel={() => setCurrentPage('home')} owners={owners} cattleData={cattleData} user={user} />;
            case 'updateCattle': return <UpdateCattleScreen onCancel={() => setCurrentPage('home')} owners={owners} user={user} />;
            case 'consult': return <ConsultScreen cattleData={cattleData} owners={owners} deceasedSoldData={deceasedSoldData} />;
            case 'activities': return <RegisterActivitiesScreen onCancel={() => setCurrentPage('home')} activities={activities} user={user} />;
            case 'admin': return isAdmin ? <AdminPanel onCancel={() => setCurrentPage('home')} user={user} /> : <HomeScreen navigate={setCurrentPage} />;
            case 'home': default: return <HomeScreen navigate={setCurrentPage} />;
        }
    };

    return (
        <div className="bg-stone-100 min-h-screen font-sans">
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigate={setCurrentPage} isAdmin={isAdmin} />
            <Header title="Finca Moreno Z" onMenuClick={() => setIsMenuOpen(true)} />
            <main>{renderPage()}</main>
        </div>
    );
}
