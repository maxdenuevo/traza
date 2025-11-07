export const NotasPage = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium mb-3">Nueva Nota</h3>
        <textarea
          className="w-full p-3 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-esant-black focus:border-transparent"
          rows={4}
          placeholder="Escribe una nota rápida..."
        />
        <button className="mt-2 w-full bg-esant-black text-esant-white py-2 rounded-lg font-medium btn-touch hover:bg-esant-gray-900">
          Guardar
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium mb-3">Historial</h3>
        <div className="text-center text-gray-400 py-8">
          No hay notas registradas
        </div>
      </div>
    </div>
  );
};
