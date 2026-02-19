import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FAB } from '../../components/common/FAB';
import { NoProjectSelected } from '../../components/common/NoProjectSelected';
import { useProjectStore } from '../../store/useProjectStore';
import { SECTORS } from '../../store/useProgramaStore';
import {
  useFacturasByProveedor,
  useFacturasStats,
  useCreateFactura,
  useUpdateFactura,
  useDeleteFactura,
} from '../../hooks/useFacturas';
import { formatCurrency } from '../../constants';
import type { Factura } from '../../types';

const PAGADO_POR_OPTIONS = ['Empresa', 'Cliente', 'Otro'];

export const FacturasPage = () => {
  const { currentProject } = useProjectStore();
  const [expandedProveedores, setExpandedProveedores] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null);
  const [detailFactura, setDetailFactura] = useState<Factura | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    fecha: '',
    valor: '',
    proveedor: '',
    pagadoPor: 'Empresa',
    detalle: '',
    sucursal: '',
    rut: '',
    direccion: '',
    sectorNombre: '',
  });

  const { data: proveedorGroups = [], isLoading } = useFacturasByProveedor(currentProject?.id || '');
  const { data: stats } = useFacturasStats(currentProject?.id || '');

  const createMutation = useCreateFactura();
  const updateMutation = useUpdateFactura();
  const deleteMutation = useDeleteFactura();

  const toggleProveedor = (proveedor: string) => {
    setExpandedProveedores((prev) => {
      const next = new Set(prev);
      if (next.has(proveedor)) {
        next.delete(proveedor);
      } else {
        next.add(proveedor);
      }
      return next;
    });
  };

  const handleAdd = () => {
    setEditingFactura(null);
    setFormData({
      numero: '',
      fecha: new Date().toISOString().split('T')[0],
      valor: '',
      proveedor: '',
      pagadoPor: 'Empresa',
      detalle: '',
      sucursal: '',
      rut: '',
      direccion: '',
      sectorNombre: '',
    });
    setShowModal(true);
  };

  const handleEdit = (factura: Factura) => {
    setEditingFactura(factura);
    setFormData({
      numero: factura.numero,
      fecha: factura.fecha.toISOString().split('T')[0],
      valor: factura.valor.toString(),
      proveedor: factura.proveedor,
      pagadoPor: factura.pagadoPor || 'Empresa',
      detalle: factura.detalle || '',
      sucursal: factura.sucursal || '',
      rut: factura.rut || '',
      direccion: factura.direccion || '',
      sectorNombre: factura.sectorNombre || '',
    });
    setDetailFactura(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.numero.trim() || !formData.valor || !formData.proveedor.trim() || !currentProject) {
      toast.error('Completa los campos requeridos');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }

    const valorConIva = Math.round(valor * 1.19);

    try {
      if (editingFactura) {
        await updateMutation.mutateAsync({
          id: editingFactura.id,
          updates: {
            numero: formData.numero,
            fecha: new Date(formData.fecha),
            valor,
            valorConIva,
            proveedor: formData.proveedor,
            pagadoPor: formData.pagadoPor,
            detalle: formData.detalle || undefined,
            sucursal: formData.sucursal || undefined,
            rut: formData.rut || undefined,
            direccion: formData.direccion || undefined,
            sectorNombre: formData.sectorNombre || undefined,
          },
        });
        toast.success('Factura actualizada');
      } else {
        await createMutation.mutateAsync({
          proyectoId: currentProject.id,
          numero: formData.numero,
          fecha: new Date(formData.fecha),
          valor,
          valorConIva,
          proveedor: formData.proveedor,
          pagadoPor: formData.pagadoPor,
          detalle: formData.detalle || undefined,
          sucursal: formData.sucursal || undefined,
          rut: formData.rut || undefined,
          direccion: formData.direccion || undefined,
          sectorNombre: formData.sectorNombre || undefined,
        });
        toast.success('Factura creada');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleDelete = async (factura: Factura) => {
    if (!confirm(`¿Eliminar factura ${factura.numero}?`)) return;

    try {
      await deleteMutation.mutateAsync(factura.id);
      toast.success('Factura eliminada');
      setDetailFactura(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProject) {
    return <NoProjectSelected icon="receipt" message="Selecciona o crea un proyecto para ver las facturas" />;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Summary Card */}
      {stats && (
        <Card className="p-6">
          <h2 className="font-semibold text-xl text-esant-black mb-1">Facturas</h2>
          <p className="text-sm text-esant-gray-600 mb-4">Gastos por proveedor</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-esant-gray-600 mb-1">Total Neto</p>
              <p className="text-xl font-bold text-esant-black">{formatCurrency(stats.totalValor)}</p>
            </div>
            <div>
              <p className="text-xs text-esant-gray-600 mb-1">Total + IVA</p>
              <p className="text-xl font-bold text-esant-red">{formatCurrency(stats.totalConIva)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-esant-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="file-text" size={16} className="text-esant-gray-500" />
              <span className="text-esant-gray-600">
                <span className="font-semibold text-esant-black">{stats.total}</span> facturas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="store" size={16} className="text-esant-gray-500" />
              <span className="text-esant-gray-600">
                <span className="font-semibold text-esant-black">{stats.proveedores}</span> proveedores
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          {(stats.pagadoPorEmpresa > 0 || stats.pagadoPorCliente > 0) && (
            <div className="flex gap-4 mt-3 text-xs">
              <span className="text-esant-gray-600">
                Empresa: <span className="font-medium">{formatCurrency(stats.pagadoPorEmpresa)}</span>
              </span>
              <span className="text-esant-gray-600">
                Cliente: <span className="font-medium">{formatCurrency(stats.pagadoPorCliente)}</span>
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Proveedores List */}
      {proveedorGroups.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="file-text" size={48} className="text-esant-gray-400 mx-auto mb-3" />
          <p className="text-esant-gray-600 mb-2">No hay facturas registradas</p>
          <p className="text-sm text-esant-gray-400">Agrega la primera factura</p>
        </Card>
      ) : (
        proveedorGroups.map(({ proveedor, facturas, totalConIva }) => {
          const isExpanded = expandedProveedores.has(proveedor);

          return (
            <div key={proveedor} className="bg-esant-white rounded-xl shadow-esant overflow-hidden">
              {/* Proveedor Header */}
              <button
                onClick={() => toggleProveedor(proveedor)}
                className="w-full p-5 flex items-center justify-between hover:bg-esant-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-esant-gray-100 flex items-center justify-center">
                    <Icon name="store" size={20} className="text-esant-gray-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="font-semibold text-lg text-esant-black">{proveedor}</h3>
                    <span className="text-sm text-esant-gray-600">
                      {facturas.length} factura{facturas.length !== 1 ? 's' : ''} • {formatCurrency(totalConIva)}
                    </span>
                  </div>
                </div>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  className="text-esant-gray-600"
                />
              </button>

              {/* Facturas List */}
              {isExpanded && (
                <div className="border-t border-esant-gray-200">
                  {facturas.map((factura) => (
                    <button
                      key={factura.id}
                      onClick={() => setDetailFactura(factura)}
                      className="w-full p-4 border-b border-esant-gray-100 last:border-b-0 hover:bg-esant-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-esant-black">#{factura.numero}</span>
                        <span className="text-sm text-esant-gray-500">
                          {format(factura.fecha, "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-esant-gray-600 truncate flex-1 mr-2">
                          {factura.detalle || 'Sin detalle'}
                        </span>
                        <span className="font-semibold text-esant-black">
                          {formatCurrency(factura.valorConIva)}
                        </span>
                      </div>
                      {factura.sectorNombre && (
                        <span className="inline-block mt-1 text-xs bg-esant-gray-100 text-esant-gray-600 px-2 py-0.5 rounded">
                          {factura.sectorNombre}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* FAB */}
      <FAB onClick={handleAdd} icon="plus" label="Nueva factura" />

      {/* Detail Modal */}
      {detailFactura && (
        <Modal
          isOpen
          onClose={() => setDetailFactura(null)}
          title={`Factura #${detailFactura.numero}`}
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-esant-gray-600">
                {format(detailFactura.fecha, "d 'de' MMMM, yyyy", { locale: es })}
              </span>
              {detailFactura.pagadoPor && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  detailFactura.pagadoPor === 'Empresa'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  Pagado por {detailFactura.pagadoPor}
                </span>
              )}
            </div>

            {/* Amounts */}
            <div className="bg-esant-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-esant-gray-600">Valor neto</span>
                <span className="font-semibold text-esant-black">{formatCurrency(detailFactura.valor)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-esant-gray-600">Total + IVA</span>
                <span className="font-bold text-esant-red">{formatCurrency(detailFactura.valorConIva)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-esant-gray-500">Proveedor</label>
                <p className="font-medium text-esant-black">{detailFactura.proveedor}</p>
              </div>

              {detailFactura.detalle && (
                <div>
                  <label className="text-xs text-esant-gray-500">Detalle</label>
                  <p className="text-esant-gray-800">{detailFactura.detalle}</p>
                </div>
              )}

              {detailFactura.sucursal && (
                <div>
                  <label className="text-xs text-esant-gray-500">Sucursal</label>
                  <p className="text-esant-gray-800">{detailFactura.sucursal}</p>
                </div>
              )}

              {detailFactura.rut && (
                <div>
                  <label className="text-xs text-esant-gray-500">RUT</label>
                  <p className="text-esant-gray-800">{detailFactura.rut}</p>
                </div>
              )}

              {detailFactura.direccion && (
                <div>
                  <label className="text-xs text-esant-gray-500">Dirección</label>
                  <p className="text-esant-gray-800">{detailFactura.direccion}</p>
                </div>
              )}

              {detailFactura.sectorNombre && (
                <div>
                  <label className="text-xs text-esant-gray-500">Sector</label>
                  <p className="text-esant-gray-800">{detailFactura.sectorNombre}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleEdit(detailFactura)}
              >
                <Icon name="edit" size={16} />
                Editar
              </Button>
              <Button
                variant="accent"
                fullWidth
                onClick={() => handleDelete(detailFactura)}
              >
                <Icon name="trash-2" size={16} />
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFactura ? 'Editar Factura' : 'Nueva Factura'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-1">Número *</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="001-2024"
                className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-1">Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">Proveedor *</label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              placeholder="Nombre del proveedor"
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-1">Valor Neto *</label>
              <input
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
              />
              {formData.valor && (
                <p className="text-xs text-esant-gray-500 mt-1">
                  + IVA: {formatCurrency(Math.round(parseFloat(formData.valor) * 1.19))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-esant-gray-600 mb-1">Pagado por</label>
              <select
                value={formData.pagadoPor}
                onChange={(e) => setFormData({ ...formData, pagadoPor: e.target.value })}
                className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
              >
                {PAGADO_POR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">Detalle</label>
            <textarea
              value={formData.detalle}
              onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
              placeholder="Descripción de la compra..."
              rows={2}
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-esant-gray-600 mb-1">Sector</label>
            <select
              value={formData.sectorNombre}
              onChange={(e) => setFormData({ ...formData, sectorNombre: e.target.value })}
              className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
            >
              <option value="">Sin sector</option>
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          {/* Collapsible additional fields */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-esant-gray-600 flex items-center gap-1">
              <Icon name="chevron-right" size={14} className="group-open:rotate-90 transition-transform" />
              Datos adicionales del proveedor
            </summary>
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-esant-gray-200">
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-1">Sucursal</label>
                <input
                  type="text"
                  value={formData.sucursal}
                  onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                  placeholder="Nombre sucursal"
                  className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-1">RUT</label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  placeholder="12.345.678-9"
                  className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-esant-gray-600 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección del proveedor"
                  className="w-full px-3 py-2 border-2 border-esant-gray-200 rounded-lg focus:outline-none focus:border-esant-black transition-colors"
                />
              </div>
            </div>
          </details>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!formData.numero.trim() || !formData.valor || !formData.proveedor.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {editingFactura ? 'Actualizar' : 'Crear'} Factura
          </Button>
        </div>
      </Modal>
    </div>
  );
};
