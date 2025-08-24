import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, Menu, X, Save, FileText, Users, Activity, Home, Eye } from 'lucide-react';

// --- Componentes de la UI ---

// Modal genérico para confirmaciones y detalles
const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-stone-200">
                <h3 className="text-xl font-bold text-emerald-800">{title}</h3>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

// Header reutilizable para cada pantalla
const Header = ({ title, onMenuClick }) => (
    <header className="bg-emerald-800 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center">
            <button onClick={onMenuClick} className="mr-4 p-2 rounded-full hover:bg-emerald-700 transition-colors">
                <Menu size={24} />
            </button>
            <img src="http://googleusercontent.com/file_content/2" alt="Logo Finca Moreno Z" className="h-10 w-10 rounded-full bg-white p-1 object-contain" />
            <h1 className="text-2xl font-bold ml-4 tracking-wider">{title}</h1>
        </div>
    </header>
);

// Menú lateral de navegación
const SideMenu = ({ isOpen, onClose, navigate }) => {
    const menuItems = [
        { name: 'Inicio', page: 'home', icon: <Home size={20} /> },
        { name: 'Registrar Res', page: 'registerCattle', icon: <Plus size={20} /> },
        { name: 'Actualizar Res', page: 'updateCattle', icon: <Edit size={20} /> },
        { name: 'Consultar', page: 'consult', icon: <FileText size={20} /> },
        { name: 'Actividades', page: 'activities', icon: <Activity size={20} /> },
        { name: 'Propietarios', page: 'registerOwner', icon: <Users size={20} /> },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <div className={`fixed top-0 left-0 h-full bg-white w-72 shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-emerald-800">Menú</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800"><X size={24} /></button>
                </div>
                <nav className="p-4">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.page}>
                                <button onClick={() => { navigate(item.page); onClose(); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-all">
                                    {item.icon}
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};


// --- Funciones de Lógica de Negocio ---

const calculateAgeInMonths = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months;
};

const determineCattleType = (cattle) => {
    if (!cattle || !cattle.birthDate || !cattle.gender) return 'N/A';
    
    const ageInMonths = calculateAgeInMonths(cattle.birthDate);

    if (ageInMonths <= 12) return 'Ternero/a';

    if (cattle.gender === 'Hembra') {
        if (cattle.offspring && cattle.offspring.length > 0) {
            const lastParto = new Date(Math.max(...cattle.offspring.map(o => new Date(o.birthDate))));
            const monthsSinceParto = calculateAgeInMonths(lastParto);
            return monthsSinceParto <= 12 ? 'Vaca Parida' : 'Vaca Horra';
        }
        return ageInMonths <= 24 ? 'Novilla' : 'Vaca';
    }

    if (cattle.gender === 'Macho') {
        if (ageInMonths <= 24) return 'Levante';
        if (cattle.isCastrated === true) return 'Macho de Engorde';
        if (cattle.isCastrated === false) return 'Toro';
        return 'Macho Adulto';
    }

    return 'Desconocido';
};


// --- Pantallas de la Aplicación ---

const HomeScreen = ({ navigate }) => {
    const buttons = [
        { label: 'Registro de Res', page: 'registerCattle', icon: <Plus className="w-12 h-12" /> },
        { label: 'Actualización de Res', page: 'updateCattle', icon: <Edit className="w-12 h-12" /> },
        { label: 'Consultar', page: 'consult', icon: <FileText className="w-12 h-12" /> },
        { label: 'Registro de Actividades', page: 'activities', icon: <Activity className="w-12 h-12" /> },
        { label: 'Registrar Propietarios', page: 'registerOwner', icon: <Users className="w-12 h-12" /> },
    ];

    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            {buttons.map((btn) => (
                <button key={btn.page} onClick={() => navigate(btn.page)} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center text-emerald-800 hover:bg-emerald-50 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 aspect-square border-b-4 border-amber-400">
                    {btn.icon}
                    <span className="mt-4 font-semibold text-lg">{btn.label}</span>
                </button>
            ))}
        </div>
    );
};

const RegisterOwnerScreen = ({ onSave, onCancel, owners }) => {
    const [name, setName] = useState('');
    const [modal, setModal] = useState({ isOpen: false, action: null });

    const handleSave = () => {
        if (name.trim()) {
            onSave({ id: Date.now(), name: name.trim() });
            setName('');
            setModal({ isOpen: false });
        }
    };
    
    const openConfirmModal = (action) => {
        if (action === 'save' && !name.trim()) {
            alert("El nombre no puede estar vacío.");
            return;
        }
        setModal({ isOpen: true, action });
    };

    const confirmAction = () => {
        if (modal.action === 'save') {
            handleSave();
        } else if (modal.action === 'cancel') {
            onCancel();
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">Registrar Nuevo Propietario</h2>
                <div className="mb-6">
                    <label htmlFor="ownerName" className="block text-stone-700 font-medium mb-2">Nombre y Apellidos</label>
                    <input
                        id="ownerName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej: Carlos Rodríguez"
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={() => openConfirmModal('cancel')} className="px-6 py-3 rounded-lg bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition-colors">Cancelar</button>
                    <button onClick={() => openConfirmModal('save')} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"><Save size={18}/> Guardar</button>
                </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-emerald-800 mb-4">Propietarios Registrados</h3>
                {owners.length > 0 ? (
                    <ul className="divide-y divide-stone-200">
                        {owners.map(owner => <li key={owner.id} className="py-3 text-stone-600">{owner.name}</li>)}
                    </ul>
                ) : (
                    <p className="text-stone-500">No hay propietarios registrados.</p>
                )}
            </div>

            {modal.isOpen && (
                <Modal onClose={() => setModal({ isOpen: false })} title="Confirmación">
                    <p className="text-stone-600 mb-6">¿Estás seguro de que deseas {modal.action === 'save' ? 'guardar este propietario' : 'cancelar la operación'}?</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setModal({ isOpen: false })} className="px-6 py-2 rounded-lg bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300">No</button>
                        <button onClick={confirmAction} className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Sí, continuar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const RegisterCattleScreen = ({ onSave, onCancel, owners, cattleData }) => {
    const [form, setForm] = useState({
        photos: [],
        id: '',
        birthDate: '',
        gender: 'Hembra',
        weight: '',
        parentsId: '',
        lastVaccines: '',
        ownerId: owners.length > 0 ? owners[0].id : ''
    });
    const [useAutoId, setUseAutoId] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, action: null });

    const cattleType = useMemo(() => determineCattleType({ birthDate: form.birthDate, gender: form.gender, offspring: [] }), [form.birthDate, form.gender]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
      if (form.photos.length < 3) {
        const newPhoto = `https://placehold.co/300x200/A8A29E/FFFFFF?text=Foto+${form.photos.length + 1}`;
        setForm(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
      }
    };

    const generateAutoId = () => {
        const allIds = cattleData.map(c => c.id.replace(/^[VM]-/, '')).filter(id => id.startsWith('FMZ-'));
        const lastIdNum = allIds.length > 0 ? Math.max(...allIds.map(id => parseInt(id.split('-')[1]))) : 0;
        return `FMZ-${String(lastIdNum + 1).padStart(3, '0')}`;
    };
    
    const validateForm = () => {
        const { id, birthDate, weight, ownerId } = form;
        const finalId = useAutoId ? generateAutoId() : id.trim();
        
        if (!finalId || !birthDate || !weight || !ownerId) {
            alert("Por favor, completa todos los campos obligatorios: Código, Fecha de Nacimiento, Peso y Propietario.");
            return false;
        }
        if (!useAutoId && cattleData.some(c => c.id.toUpperCase() === finalId.toUpperCase())) {
            alert("El código de identificación manual ya existe.");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        const finalId = useAutoId ? generateAutoId() : form.id.trim();
        const newCattle = {
            ...form,
            id: finalId,
            status: 'Viva',
            offspring: [],
            weight: parseFloat(form.weight)
        };
        onSave(newCattle);
        setModal({ isOpen: false });
    };
    
    const openConfirmModal = (action) => {
        if (action === 'save' && !validateForm()) return;
        setModal({ isOpen: true, action });
    };

    const confirmAction = () => {
        if (modal.action === 'save') {
            handleSave();
        } else if (modal.action === 'cancel') {
            onCancel();
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">Registrar Nueva Res</h2>
                
                <div className="mb-4">
                    <label className="block text-stone-700 font-medium mb-2">Fotos (máx. 3)</label>
                    <div className="flex gap-4 items-center">
                        {form.photos.map((photo, index) => (
                            <img key={index} src={photo} alt={`Foto ${index+1}`} className="w-24 h-24 object-cover rounded-lg shadow-md"/>
                        ))}
                        {form.photos.length < 3 && (
                            <button onClick={handlePhotoChange} className="w-24 h-24 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors">
                                <Plus size={24} />
                                <span className="text-sm mt-1">Añadir</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Código de Identificación</label>
                        <div className="flex items-center gap-2">
                            <input type="text" name="id" value={useAutoId ? generateAutoId() : form.id} onChange={handleChange} disabled={useAutoId} className="w-full px-4 py-3 border border-stone-300 rounded-lg disabled:bg-stone-100" />
                            <button onClick={() => setUseAutoId(!useAutoId)} className={`px-4 py-3 rounded-lg font-semibold transition-colors ${useAutoId ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Auto</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Fecha de Nacimiento</label>
                        <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Género</label>
                        <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white">
                            <option>Hembra</option>
                            <option>Macho</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Peso (Kg)</label>
                        <input type="number" name="weight" value={form.weight} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg" />
                    </div>
                     {form.gender === 'Hembra' && (
                        <div>
                            <label className="block text-stone-700 font-medium mb-2">Crías</label>
                            <input type="number" value="0" disabled className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-100" />
                        </div>
                    )}
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Código de los Padres</label>
                        <input type="text" name="parentsId" value={form.parentsId} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-stone-700 font-medium mb-2">Tipo de Cabeza de Ganado</label>
                        <input type="text" value={cattleType} disabled className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-100" />
                    </div>
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Estado</label>
                        <input type="text" value="Viva" disabled className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-100" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-stone-700 font-medium mb-2">Últimas Vacunas</label>
                        <input type="text" name="lastVaccines" value={form.lastVaccines} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-stone-700 font-medium mb-2">Propietario</label>
                        <select name="ownerId" value={form.ownerId} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white">
                            {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => openConfirmModal('cancel')} className="px-6 py-3 rounded-lg bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition-colors">Cancelar</button>
                    <button onClick={() => openConfirmModal('save')} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"><Save size={18}/> Guardar</button>
                </div>
            </div>
            {modal.isOpen && (
                <Modal onClose={() => setModal({ isOpen: false })} title="Confirmación">
                    <p className="text-stone-600 mb-6">¿Estás seguro de que deseas {modal.action === 'save' ? 'guardar esta res' : 'cancelar el registro'}?</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setModal({ isOpen: false })} className="px-6 py-2 rounded-lg bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300">No</button>
                        <button onClick={confirmAction} className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Sí, continuar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const UpdateCattleScreen = ({ cattleData, owners, onUpdate, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCattle, setSelectedCattle] = useState(null);
    const [form, setForm] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
    const [offspringForm, setOffspringForm] = useState({ calfId: '', birthDate: '' });
    const [statusChangeDate, setStatusChangeDate] = useState('');

    const handleSearch = () => {
        const found = cattleData.find(c => c.id.trim().toLowerCase() === searchTerm.trim().toLowerCase());
        if (found) {
            setSelectedCattle(found);
            setForm({ ...found });
        } else {
            alert("Código inexistente, valide que este correcto");
            setSelectedCattle(null);
            setForm(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCastratedChange = (value) => {
        setForm(prev => ({...prev, isCastrated: value}));
    };

    const handleUpdate = () => {
        onUpdate(form);
        setModal({ isOpen: false });
        setSelectedCattle(null);
        setForm(null);
        setSearchTerm('');
    };
    
    const openConfirmModal = (type, data = null) => {
        setModal({ isOpen: true, type, data });
    };

    const confirmAction = () => {
        if (modal.type === 'update') {
            handleUpdate();
        } else if (modal.type === 'cancel') {
            onCancel();
        } else if (modal.type === 'addOffspring') {
            if (!offspringForm.calfId || !offspringForm.birthDate) {
                alert("Debe ingresar el código y la fecha de parto de la cría.");
                return;
            }
            const newOffspring = { calfId: offspringForm.calfId, birthDate: offspringForm.birthDate };
            setForm(prev => ({...prev, offspring: [...prev.offspring, newOffspring]}));
            setOffspringForm({ calfId: '', birthDate: '' });
            setModal({isOpen: false});
        } else if (modal.type === 'changeStatus') {
            if (!statusChangeDate) {
                alert("Debe ingresar la fecha.");
                return;
            }
            let newId = form.id;
            const newStatus = modal.data.newStatus;
            if (newStatus === 'Vendida') newId = `V-${form.id}`;
            if (newStatus === 'Muerta') newId = `M-${form.id}`;
            
            onUpdate({ ...form, id: newId, status: newStatus, statusChangeDate: statusChangeDate }, true);
            setModal({ isOpen: false });
            setSelectedCattle(null);
            setForm(null);
            setSearchTerm('');
            setStatusChangeDate('');
        }
    };
    
    const ageInMonths = useMemo(() => selectedCattle ? calculateAgeInMonths(selectedCattle.birthDate) : 0, [selectedCattle]);
    const cattleType = useMemo(() => determineCattleType(form), [form]);

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">Actualizar Res</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por código de identificación..."
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button onClick={handleSearch} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center gap-2"><Search size={18}/> Buscar</button>
                </div>
            </div>

            {selectedCattle && form && (
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-stone-800 mb-4">Información de: {selectedCattle.id}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-3 bg-stone-100 rounded-lg">
                            <label className="block text-sm font-medium text-stone-500">Fecha de Nacimiento</label>
                            <p className="text-stone-800 font-semibold">{form.birthDate}</p>
                        </div>
                        <div className="p-3 bg-stone-100 rounded-lg">
                            <label className="block text-sm font-medium text-stone-500">Género</label>
                            <p className="text-stone-800 font-semibold">{form.gender}</p>
                        </div>
                         <div className="p-3 bg-stone-100 rounded-lg">
                            <label className="block text-sm font-medium text-stone-500">Tipo de Ganado</label>
                            <p className="text-stone-800 font-semibold">{cattleType}</p>
                        </div>
                        
                        <div>
                            <label className="block text-stone-700 font-medium mb-2">Peso (Kg)</label>
                            <input type="number" name="weight" value={form.weight} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg" />
                        </div>
                        
                        {form.gender === 'Hembra' && (
                            <div>
                                <label className="block text-stone-700 font-medium mb-2">Crías ({form.offspring.length})</label>
                                <button onClick={() => openConfirmModal('addOffspring')} className="w-full px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600">Añadir Cría</button>
                            </div>
                        )}
                        
                        {form.gender === 'Macho' && ageInMonths > 24 && (
                            <div>
                                <label className="block text-stone-700 font-medium mb-2">Castración</label>
                                <div className="flex gap-2">
                                    <button onClick={() => handleCastratedChange(true)} className={`w-full py-2 rounded-lg transition-colors ${form.isCastrated === true ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Capado</button>
                                    <button onClick={() => handleCastratedChange(false)} className={`w-full py-2 rounded-lg transition-colors ${form.isCastrated === false ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>Sin Capar</button>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-stone-700 font-medium mb-2">Estado</label>
                             <select value={form.status} onChange={(e) => { if(e.target.value !== 'Viva') openConfirmModal('changeStatus', { newStatus: e.target.value }) }} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white">
                                <option>Viva</option>
                                <option>Vendida</option>
                                <option>Muerta</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-stone-700 font-medium mb-2">Propietario</label>
                            <select name="ownerId" value={form.ownerId} onChange={handleChange} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white">
                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => openConfirmModal('cancel')} className="px-6 py-3 rounded-lg bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300">Cancelar</button>
                        <button onClick={() => openConfirmModal('update')} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Actualizar</button>
                    </div>
                </div>
            )}
            
            {modal.isOpen && modal.type === 'addOffspring' && (
                <Modal onClose={() => setModal({ isOpen: false })} title="Añadir Cría">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-stone-700 font-medium mb-2">Código de la Cría</label>
                            <input type="text" value={offspringForm.calfId} onChange={e => setOffspringForm({...offspringForm, calfId: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-medium mb-2">Fecha de Parto</label>
                            <input type="date" value={offspringForm.birthDate} onChange={e => setOffspringForm({...offspringForm, birthDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setModal({ isOpen: false })} className="px-6 py-2 rounded-lg bg-stone-200">Cancelar</button>
                        <button onClick={confirmAction} className="px-6 py-2 rounded-lg bg-sky-500 text-white">Guardar</button>
                    </div>
                </Modal>
            )}
            
            {modal.isOpen && modal.type === 'changeStatus' && (
                <Modal onClose={() => setModal({ isOpen: false })} title={`Cambiar Estado a ${modal.data.newStatus}`}>
                    <p className="mb-4">Se requiere la fecha de la {modal.data.newStatus === 'Vendida' ? 'venta' : 'muerte'}.</p>
                    <div>
                        <label className="block text-stone-700 font-medium mb-2">Fecha</label>
                        <input type="date" value={statusChangeDate} onChange={e => setStatusChangeDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <p className="text-red-600 font-medium mt-4">¡Atención! Esta acción es irreversible y moverá el registro.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setModal({ isOpen: false })} className="px-6 py-2 rounded-lg bg-stone-200">Cancelar</button>
                        <button onClick={confirmAction} className="px-6 py-2 rounded-lg bg-red-600 text-white">Confirmar Cambio</button>
                    </div>
                </Modal>
            )}

            {modal.isOpen && (modal.type === 'update' || modal.type === 'cancel') && (
                <Modal onClose={() => setModal({ isOpen: false })} title="Confirmación">
                    <p>¿Estás seguro de que deseas {modal.type === 'update' ? 'actualizar la información' : 'cancelar la operación'}?</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setModal({ isOpen: false })} className="px-6 py-2 rounded-lg bg-stone-200">No</button>
                        <button onClick={confirmAction} className="px-6 py-2 rounded-lg bg-emerald-600 text-white">Sí, continuar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ConsultScreen = ({ cattleData, owners, deceasedSoldData }) => {
    const [view, setView] = useState('menu'); // menu, byOwner, all, deceasedSold
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, cattle: null });

    const CattleCard = ({ cattle, onClick }) => {
        const owner = owners.find(o => o.id === cattle.ownerId);
        return (
            <div onClick={() => onClick(cattle)} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-amber-400">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-stone-800">{cattle.id}</p>
                        <p className="text-stone-600">{determineCattleType(cattle)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${cattle.status === 'Viva' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {cattle.status}
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-stone-500">Propietario: <span className="font-medium text-stone-700">{owner ? owner.name : 'N/A'}</span></p>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (view) {
            case 'byOwner':
                if (!selectedOwner) {
                    return (
                        <div>
                            <button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button>
                            <h3 className="text-xl font-bold mb-4">Selecciona un Propietario</h3>
                            <div className="space-y-2">
                                {owners.map(o => <button key={o.id} onClick={() => setSelectedOwner(o)} className="w-full text-left p-4 bg-stone-100 rounded-lg hover:bg-emerald-50">{o.name}</button>)}
                            </div>
                        </div>
                    );
                }
                const ownerCattle = cattleData.filter(c => c.ownerId === selectedOwner.id);
                return (
                    <div>
                        <button onClick={() => setSelectedOwner(null)} className="mb-4 text-emerald-600 font-semibold">&larr; Volver a Propietarios</button>
                        <h3 className="text-xl font-bold mb-4">Reses de {selectedOwner.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ownerCattle.length > 0 ? ownerCattle.map(c => <CattleCard key={c.id} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />) : <p>Este propietario no tiene reses.</p>}
                        </div>
                    </div>
                );
            case 'all':
                return (
                    <div>
                        <button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button>
                        <h3 className="text-xl font-bold mb-4">Listado Completo de Reses Vivas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cattleData.map(c => <CattleCard key={c.id} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />)}
                        </div>
                    </div>
                );
            case 'deceasedSold':
                return (
                    <div>
                        <button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button>
                        <h3 className="text-xl font-bold mb-4">Listado de Reses Vendidas o Muertas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deceasedSoldData.map(c => <CattleCard key={c.id} cattle={c} onClick={(cattle) => setDetailsModal({ isOpen: true, cattle })} />)}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <button onClick={() => setView('byOwner')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Consultar por Propietarios</button>
                        <button onClick={() => setView('all')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Listado de Reses Vivas</button>
                        <button onClick={() => setView('deceasedSold')} className="w-full p-6 bg-white rounded-lg shadow-md text-left text-lg font-semibold hover:bg-emerald-50">Listado de Reses Muertas o Vendidas</button>
                    </div>
                );
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">Consultar Registros</h2>
                {renderContent()}
            </div>
            {detailsModal.isOpen && detailsModal.cattle && (
                <Modal onClose={() => setDetailsModal({ isOpen: false })} title={`Detalles de ${detailsModal.cattle.id}`}>
                    <div className="space-y-3">
                        {Object.entries(detailsModal.cattle).map(([key, value]) => {
                            if (key === 'photos' || key === 'offspring') return null;
                            return (
                                <div key={key} className="flex justify-between">
                                    <span className="font-medium text-stone-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="text-stone-800">{String(value)}</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between">
                             <span className="font-medium text-stone-600">Tipo de Ganado:</span>
                             <span className="text-stone-800">{determineCattleType(detailsModal.cattle)}</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button onClick={() => setDetailsModal({isOpen: false})} className="px-6 py-2 rounded-lg bg-emerald-600 text-white">Cerrar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const RegisterActivitiesScreen = ({ activities, onSave }) => {
    const [view, setView] = useState('menu');
    const [form, setForm] = useState({ date: '', status: 'En curso', observations: '' });
    const [currentPage, setCurrentPage] = useState(0);
    const activitiesPerPage = 10;

    const handleSave = () => {
        if (form.date && form.observations) {
            onSave({ id: Date.now(), ...form });
            setForm({ date: '', status: 'En curso', observations: '' });
            setView('consult');
        } else {
            alert("Por favor, completa la fecha y las observaciones.");
        }
    };

    const sortedActivities = useMemo(() => [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)), [activities]);
    const paginatedActivities = sortedActivities.slice(currentPage * activitiesPerPage, (currentPage + 1) * activitiesPerPage);
    const totalPages = Math.ceil(sortedActivities.length / activitiesPerPage);

    const renderContent = () => {
        switch (view) {
            case 'add':
                return (
                    <div>
                        <button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button>
                        <h3 className="text-xl font-bold mb-4">Agregar Nueva Actividad</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-stone-700 font-medium mb-2">Fecha de Actividad</label>
                                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-stone-700 font-medium mb-2">Estado</label>
                                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                                    <option>En curso</option>
                                    <option>Completada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-stone-700 font-medium mb-2">Observaciones</label>
                                <textarea value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} rows="4" className="w-full px-4 py-2 border rounded-lg"></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleSave} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold">Guardar Actividad</button>
                            </div>
                        </div>
                    </div>
                );
            case 'consult':
                return (
                    <div>
                        <button onClick={() => setView('menu')} className="mb-4 text-emerald-600 font-semibold">&larr; Volver</button>
                        <h3 className="text-xl font-bold mb-4">Registro de Actividades</h3>
                        <div className="space-y-3">
                            {paginatedActivities.map(act => (
                                <div key={act.id} className="p-4 bg-stone-50 rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{act.date}</p>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${act.status === 'Completada' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{act.status}</span>
                                    </div>
                                    <p className="mt-2 text-stone-600">{act.observations}</p>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 rounded-full disabled:opacity-50 bg-stone-200"><ChevronLeft/></button>
                                <span>Página {currentPage + 1} de {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="p-2 rounded-full disabled:opacity-50 bg-stone-200"><ChevronRight/></button>
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col md:flex-row gap-4">
                        <button onClick={() => setView('add')} className="w-full p-6 bg-white rounded-lg shadow-md text-center text-lg font-semibold hover:bg-emerald-50">Agregar Actividad</button>
                        <button onClick={() => setView('consult')} className="w-full p-6 bg-white rounded-lg shadow-md text-center text-lg font-semibold hover:bg-emerald-50">Consultar Registro</button>
                    </div>
                );
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">Gestión de Actividades</h2>
                {renderContent()}
            </div>
        </div>
    );
};

// --- Componente Principal de la App ---

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- Lógica de Persistencia de Datos ---
    const loadFromLocalStorage = (key, defaultValue) => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage`, error);
            return defaultValue;
        }
    };

    const [owners, setOwners] = useState(() => loadFromLocalStorage('fmz_owners', []));
    const [cattleData, setCattleData] = useState(() => loadFromLocalStorage('fmz_cattleData', []));
    const [deceasedSoldData, setDeceasedSoldData] = useState(() => loadFromLocalStorage('fmz_deceasedSoldData', []));
    const [activities, setActivities] = useState(() => loadFromLocalStorage('fmz_activities', []));

    useEffect(() => { localStorage.setItem('fmz_owners', JSON.stringify(owners)); }, [owners]);
    useEffect(() => { localStorage.setItem('fmz_cattleData', JSON.stringify(cattleData)); }, [cattleData]);
    useEffect(() => { localStorage.setItem('fmz_deceasedSoldData', JSON.stringify(deceasedSoldData)); }, [deceasedSoldData]);
    useEffect(() => { localStorage.setItem('fmz_activities', JSON.stringify(activities)); }, [activities]);

    const pageTitles = {
        home: 'Finca Moreno Z',
        registerCattle: 'Registro de Res',
        updateCattle: 'Actualización de Res',
        consult: 'Consultas',
        activities: 'Actividades',
        registerOwner: 'Propietarios',
    };

    const navigate = (page) => {
        setCurrentPage(page);
    };

    const handleSaveOwner = (newOwner) => {
        setOwners(prev => [...prev, newOwner]);
        alert('Propietario guardado con éxito!');
        navigate('home');
    };
    
    const handleSaveCattle = (newCattle) => {
        setCattleData(prev => [...prev, newCattle]);
        alert('Res guardada con éxito!');
        navigate('home');
    };
    
    const handleUpdateCattle = (updatedCattle, isStatusChange = false) => {
        if (isStatusChange) {
            setCattleData(prev => prev.filter(c => c.id !== updatedCattle.id.substring(2)));
            setDeceasedSoldData(prev => [...prev, updatedCattle]);
            alert(`El estado de la res ${updatedCattle.id} ha sido actualizado.`);
        } else {
            setCattleData(prev => prev.map(c => c.id === updatedCattle.id ? updatedCattle : c));
            alert(`La información de la res ${updatedCattle.id} ha sido actualizada.`);
        }
    };
    
    const handleSaveActivity = (newActivity) => {
        setActivities(prev => [newActivity, ...prev]);
        alert('Actividad guardada con éxito!');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'registerOwner':
                return <RegisterOwnerScreen onSave={handleSaveOwner} onCancel={() => navigate('home')} owners={owners} />;
            case 'registerCattle':
                return <RegisterCattleScreen onSave={handleSaveCattle} onCancel={() => navigate('home')} owners={owners} cattleData={cattleData} />;
            case 'updateCattle':
                return <UpdateCattleScreen cattleData={cattleData} owners={owners} onUpdate={handleUpdateCattle} onCancel={() => navigate('home')} />;
            case 'consult':
                return <ConsultScreen cattleData={cattleData} owners={owners} deceasedSoldData={deceasedSoldData} />;
            case 'activities':
                return <RegisterActivitiesScreen activities={activities} onSave={handleSaveActivity} />;
            case 'home':
            default:
                return <HomeScreen navigate={navigate} />;
        }
    };

    return (
        <div className="bg-stone-100 min-h-screen font-sans">
            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigate={navigate} />
            <Header title={pageTitles[currentPage] || 'Finca Moreno Z'} onMenuClick={() => setIsMenuOpen(true)} />
            <main>
                {renderPage()}
            </main>
        </div>
    );
}
