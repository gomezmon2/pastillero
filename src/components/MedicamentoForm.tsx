import React, { useState, useEffect } from 'react';
import type { Medicamento } from '../types';
import { uploadMedicamentoImage, compressImage } from '../utils/imageUpload';
import './MedicamentoForm.css';

interface MedicamentoFormProps {
  onSubmit: (medicamento: Omit<Medicamento, 'id'>) => void;
  onCancel?: () => void;
  medicamentoToEdit?: Medicamento;
}

const MedicamentoForm: React.FC<MedicamentoFormProps> = ({ onSubmit, onCancel, medicamentoToEdit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
    horarios: [''],
    numeroPastillas: 1,
    imagenUrl: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    notas: '',
    activo: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (medicamentoToEdit) {
      setFormData({
        nombre: medicamentoToEdit.nombre,
        dosis: medicamentoToEdit.dosis,
        frecuencia: medicamentoToEdit.frecuencia,
        horarios: medicamentoToEdit.horarios,
        numeroPastillas: medicamentoToEdit.numeroPastillas || 1,
        imagenUrl: medicamentoToEdit.imagenUrl || '',
        fechaInicio: medicamentoToEdit.fechaInicio,
        fechaFin: medicamentoToEdit.fechaFin || '',
        notas: medicamentoToEdit.notas || '',
        activo: medicamentoToEdit.activo,
      });
      // Cargar vista previa de imagen si existe
      if (medicamentoToEdit.imagenUrl) {
        setImagePreview(medicamentoToEdit.imagenUrl);
      }
    }
  }, [medicamentoToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.dosis || !formData.frecuencia) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const horariosFiltrados = formData.horarios.filter(h => h.trim() !== '');

    if (horariosFiltrados.length === 0) {
      alert('Por favor agrega al menos un horario');
      return;
    }

    // Subir imagen si hay un archivo seleccionado
    let imagenUrl = formData.imagenUrl;
    if (imageFile) {
      setUploadingImage(true);
      try {
        // Comprimir la imagen antes de subir
        const compressedFile = await compressImage(imageFile);
        // Generar ID temporal para el archivo
        const tempId = medicamentoToEdit?.id || Date.now().toString();
        const uploadedUrl = await uploadMedicamentoImage(compressedFile, tempId);
        if (uploadedUrl) {
          imagenUrl = uploadedUrl;
        }
      } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen. El medicamento se guardará sin imagen.');
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit({
      ...formData,
      horarios: horariosFiltrados,
      imagenUrl: imagenUrl,
      activo: formData.activo,
    });

    // Reset form solo si no estamos editando
    if (!medicamentoToEdit) {
      setFormData({
        nombre: '',
        dosis: '',
        frecuencia: '',
        horarios: [''],
        numeroPastillas: 1,
        imagenUrl: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        notas: '',
        activo: true,
      });
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP, GIF)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    setImageFile(file);

    // Generar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imagenUrl: '' });
  };

  const handleHorarioChange = (index: number, value: string) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index] = value;
    setFormData({ ...formData, horarios: newHorarios });
  };

  const addHorario = () => {
    setFormData({ ...formData, horarios: [...formData.horarios, ''] });
  };

  const removeHorario = (index: number) => {
    const newHorarios = formData.horarios.filter((_, i) => i !== index);
    setFormData({ ...formData, horarios: newHorarios.length > 0 ? newHorarios : [''] });
  };

  return (
    <form className="medicamento-form" onSubmit={handleSubmit}>
      <h2>{medicamentoToEdit ? 'Editar Medicamento' : 'Agregar Medicamento'}</h2>

      <div className="form-group">
        <label htmlFor="nombre">Nombre del medicamento *</label>
        <input
          type="text"
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="ej: Ibuprofeno"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dosis">Dosis *</label>
        <input
          type="text"
          id="dosis"
          value={formData.dosis}
          onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
          placeholder="ej: 400mg"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="frecuencia">Frecuencia *</label>
        <select
          id="frecuencia"
          value={formData.frecuencia}
          onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
          required
        >
          <option value="">Selecciona una frecuencia</option>
          <option value="Cada 4 horas">Cada 4 horas</option>
          <option value="Cada 6 horas">Cada 6 horas</option>
          <option value="Cada 8 horas">Cada 8 horas</option>
          <option value="Cada 12 horas">Cada 12 horas</option>
          <option value="Diario">Una vez al día</option>
          <option value="Dos veces al día">Dos veces al día</option>
          <option value="Tres veces al día">Tres veces al día</option>
          <option value="Semanal">Semanal</option>
          <option value="Personalizado">Personalizado</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="numeroPastillas">Número de pastillas por toma</label>
        <input
          type="number"
          id="numeroPastillas"
          value={formData.numeroPastillas}
          onChange={(e) => setFormData({ ...formData, numeroPastillas: parseFloat(e.target.value) || 1 })}
          placeholder="ej: 1, 2, 0.5"
          min="0.25"
          step="0.25"
        />
        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Puedes usar decimales (ej: 0.5 para media pastilla)
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="imagen">Imagen del medicamento</label>
        <input
          type="file"
          id="imagen"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {imagePreview ? (
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <img
                src={imagePreview}
                alt="Vista previa"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '2px solid #e0e0e0'
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          ) : (
            <label
              htmlFor="imagen"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                width: 'fit-content'
              }}
            >
              📷 Seleccionar imagen
            </label>
          )}
          <small style={{ color: '#666', fontSize: '12px' }}>
            Formatos: JPG, PNG, WebP, GIF. Máximo: 5MB
          </small>
        </div>
      </div>

      <div className="form-group">
        <label>Horarios *</label>
        {formData.horarios.map((horario, index) => (
          <div key={index} className="horario-input-group">
            <input
              type="time"
              value={horario}
              onChange={(e) => handleHorarioChange(index, e.target.value)}
              required
            />
            {formData.horarios.length > 1 && (
              <button
                type="button"
                onClick={() => removeHorario(index)}
                className="btn-remove"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addHorario} className="btn-add-horario">
          + Agregar otro horario
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha de inicio</label>
          <input
            type="date"
            id="fechaInicio"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fechaFin">Fecha de fin (opcional)</label>
          <input
            type="date"
            id="fechaFin"
            value={formData.fechaFin}
            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notas">Notas adicionales</label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Instrucciones especiales, efectos secundarios, etc."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={uploadingImage}>
          {uploadingImage ? '⏳ Subiendo imagen...' : medicamentoToEdit ? 'Actualizar Medicamento' : 'Guardar Medicamento'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={uploadingImage}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default MedicamentoForm;
