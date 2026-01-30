-- ============================================================================
-- ESANT MARIA - Schema SQL para Supabase
-- ============================================================================
-- Este schema está ordenado por dependencias y puede ejecutarse directamente.
-- Requisitos: Supabase project con auth habilitado
-- ============================================================================

-- ============================================================================
-- EXTENSIONES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NIVEL 0: Tablas sin dependencias externas
-- ============================================================================

-- Proyectos de construcción
CREATE TABLE public.proyectos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  cliente text NOT NULL,
  estado text NOT NULL CHECK (estado = ANY (ARRAY['planificacion'::text, 'en_obra'::text, 'pausado'::text, 'terminado'::text])),
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_estimada_fin timestamp with time zone,
  direccion text,
  descripcion text,
  presupuesto_total numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proyectos_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- NIVEL 1: Tablas que dependen solo de auth.users
-- ============================================================================

-- Perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  nombre text NOT NULL,
  rol text NOT NULL CHECK (rol = ANY (ARRAY['admin'::text, 'jefe_proyecto'::text, 'especialista'::text, 'trabajador'::text, 'subcontratado'::text, 'cliente'::text])),
  telefono text NOT NULL,
  especialidad text,
  avatar text,
  rut text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- NIVEL 2: Tablas que dependen de proyectos y/o profiles
-- ============================================================================

-- Relación muchos a muchos: usuarios asignados a proyectos
CREATE TABLE public.proyecto_usuarios (
  proyecto_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proyecto_usuarios_pkey PRIMARY KEY (proyecto_id, user_id),
  CONSTRAINT proyecto_usuarios_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT proyecto_usuarios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Visitas a obra (calendario)
CREATE TABLE public.visitas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  fecha timestamp with time zone NOT NULL,
  hora text,
  estado text NOT NULL CHECK (estado = ANY (ARRAY['programada'::text, 'en_curso'::text, 'completada'::text])),
  notas_generales text,
  creado_por uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT visitas_pkey PRIMARY KEY (id),
  CONSTRAINT visitas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT visitas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.profiles(id)
);

-- Items de checkbox (verificación diaria/semanal/etc)
CREATE TABLE public.checkbox_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  sector_nombre text,
  descripcion text NOT NULL,
  periodicidad text NOT NULL DEFAULT 'diario'::text CHECK (periodicidad = ANY (ARRAY['diario'::text, 'semanal'::text, 'quincenal'::text, 'mensual'::text])),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT checkbox_items_pkey PRIMARY KEY (id),
  CONSTRAINT checkbox_items_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE
);

-- Documentos y archivos
CREATE TABLE public.documentos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['pdf'::text, 'docx'::text, 'xlsx'::text, 'dwg'::text, 'jpg'::text, 'png'::text, 'otro'::text])),
  categoria text NOT NULL CHECK (categoria = ANY (ARRAY['planos'::text, 'permisos'::text, 'anteproyecto'::text, 'presupuesto'::text, 'contratos'::text, 'fotos'::text, 'otro'::text])),
  url text NOT NULL,
  tamaño bigint NOT NULL,
  estado text CHECK (estado = ANY (ARRAY['borrador'::text, 'revision'::text, 'aprobado'::text, 'vigente'::text, 'vencido'::text])),
  fecha_aprobacion timestamp with time zone,
  subio_por uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documentos_pkey PRIMARY KEY (id),
  CONSTRAINT documentos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT documentos_subio_por_fkey FOREIGN KEY (subio_por) REFERENCES public.profiles(id)
);

-- Facturas por proveedor
CREATE TABLE public.facturas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  numero text NOT NULL,
  fecha date NOT NULL,
  valor numeric NOT NULL,
  valor_con_iva numeric NOT NULL,
  proveedor text NOT NULL,
  pagado_por text,
  detalle text,
  sucursal text,
  rut text,
  direccion text,
  archivo_url text,
  sector_nombre text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT facturas_pkey PRIMARY KEY (id),
  CONSTRAINT facturas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE
);

-- Informes generados
CREATE TABLE public.informes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  numero integer NOT NULL,
  fecha date NOT NULL,
  periodicidad text NOT NULL CHECK (periodicidad = ANY (ARRAY['diario'::text, 'semanal'::text, 'quincenal'::text, 'mensual'::text])),
  contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
  archivo_url text,
  generado_por uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT informes_pkey PRIMARY KEY (id),
  CONSTRAINT informes_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT informes_generado_por_fkey FOREIGN KEY (generado_por) REFERENCES public.profiles(id)
);

-- Notificaciones para usuarios
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['tarea_asignada'::text, 'tarea_actualizada'::text, 'visita_programada'::text, 'documento_subido'::text, 'presupuesto_actualizado'::text, 'mensaje'::text])),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  metadata jsonb,
  enlace_accion text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Items de presupuesto
CREATE TABLE public.presupuesto_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  categoria text NOT NULL CHECK (categoria = ANY (ARRAY['servicio'::text, 'mano_de_obra'::text, 'materiales'::text, 'adicionales'::text, 'diseño'::text, 'construccion'::text, 'mobiliario'::text, 'otro'::text])),
  descripcion text NOT NULL,
  monto_estimado numeric NOT NULL,
  monto_real numeric,
  porcentaje_ejecutado integer DEFAULT 0 CHECK (porcentaje_ejecutado >= 0 AND porcentaje_ejecutado <= 100),
  archivo_url text,
  notifica_cambios boolean DEFAULT false,
  ultima_actualizacion timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT presupuesto_items_pkey PRIMARY KEY (id),
  CONSTRAINT presupuesto_items_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE
);

-- Programa de obra por sector
CREATE TABLE public.programa_sectores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  sector_nombre text NOT NULL,
  fecha_inicio date,
  fecha_entrega_propuesta date,
  fecha_entrega_real date,
  obras text,
  valor_estimado numeric,
  valor_actual numeric,
  status text NOT NULL DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'en_curso'::text, 'pausado'::text, 'entregado'::text, 'cancelado'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT programa_sectores_pkey PRIMARY KEY (id),
  CONSTRAINT programa_sectores_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE
);

-- Control de asistencia de trabajadores
CREATE TABLE public.asistencia (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  trabajador_id uuid NOT NULL,
  fecha date NOT NULL,
  presente boolean NOT NULL DEFAULT false,
  registrado_por uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT asistencia_pkey PRIMARY KEY (id),
  CONSTRAINT asistencia_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT asistencia_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES public.profiles(id),
  CONSTRAINT asistencia_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.profiles(id),
  CONSTRAINT asistencia_unique_fecha UNIQUE (proyecto_id, trabajador_id, fecha)
);

-- ============================================================================
-- NIVEL 3: Tablas que dependen del nivel 2
-- ============================================================================

-- Asuntos tratados en visitas
CREATE TABLE public.asuntos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  visita_id uuid NOT NULL,
  area text NOT NULL,
  descripcion text NOT NULL,
  encargado_id uuid,
  notas_adicionales text,
  convertido_a_pendiente boolean DEFAULT false,
  pendiente_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT asuntos_pkey PRIMARY KEY (id),
  CONSTRAINT asuntos_visita_id_fkey FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE CASCADE,
  CONSTRAINT asuntos_encargado_id_fkey FOREIGN KEY (encargado_id) REFERENCES public.profiles(id)
);

-- Registros de verificación de checkbox
CREATE TABLE public.checkbox_checks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL,
  fecha date NOT NULL,
  completado boolean NOT NULL DEFAULT false,
  checked_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT checkbox_checks_pkey PRIMARY KEY (id),
  CONSTRAINT checkbox_checks_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.checkbox_items(id) ON DELETE CASCADE,
  CONSTRAINT checkbox_checks_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES public.profiles(id),
  CONSTRAINT checkbox_checks_unique_fecha UNIQUE (item_id, fecha)
);

-- Inventario de materiales
CREATE TABLE public.materiales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  codigo text,
  descripcion text NOT NULL,
  marca text,
  modelo text,
  sucursal text,
  cantidad numeric NOT NULL DEFAULT 0,
  proveedor text,
  ubicacion text,
  factura_id uuid,
  sector_nombre text,
  estado text NOT NULL DEFAULT 'disponible'::text CHECK (estado = ANY (ARRAY['disponible'::text, 'agotado'::text, 'por_comprar'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materiales_pkey PRIMARY KEY (id),
  CONSTRAINT materiales_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT materiales_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON DELETE SET NULL
);

-- Permisos de construcción (edificación, municipal, etc)
CREATE TABLE public.permisos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['edificacion'::text, 'municipal'::text, 'recepcion_obra'::text, 'otro'::text])),
  estado text NOT NULL CHECK (estado = ANY (ARRAY['pendiente'::text, 'en_tramite'::text, 'aprobado'::text, 'vencido'::text])),
  fecha_solicitud timestamp with time zone,
  fecha_aprobacion timestamp with time zone,
  fecha_vencimiento timestamp with time zone,
  vigencia_meses integer,
  documento_id uuid,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permisos_pkey PRIMARY KEY (id),
  CONSTRAINT permisos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT permisos_documento_id_fkey FOREIGN KEY (documento_id) REFERENCES public.documentos(id) ON DELETE SET NULL
);

-- ============================================================================
-- NIVEL 4: Tablas que dependen del nivel 3
-- ============================================================================

-- Pendientes (tareas) por sector
CREATE TABLE public.pendientes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  area text NOT NULL,
  tarea text NOT NULL,
  descripcion text,
  encargado_id uuid NOT NULL,
  estado text NOT NULL CHECK (estado = ANY (ARRAY['creada'::text, 'en_progreso'::text, 'pausada'::text, 'completada'::text, 'cancelada'::text])),
  prioridad text CHECK (prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text])),
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  fecha_vencimiento timestamp with time zone,
  fecha_completado timestamp with time zone,
  notas_adicionales text,
  attachments text[],
  creado_por uuid NOT NULL,
  visita_id uuid,
  asunto_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pendientes_pkey PRIMARY KEY (id),
  CONSTRAINT pendientes_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT pendientes_encargado_id_fkey FOREIGN KEY (encargado_id) REFERENCES public.profiles(id),
  CONSTRAINT pendientes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.profiles(id),
  CONSTRAINT pendientes_visita_id_fkey FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE SET NULL,
  CONSTRAINT pendientes_asunto_id_fkey FOREIGN KEY (asunto_id) REFERENCES public.asuntos(id) ON DELETE SET NULL
);

-- ============================================================================
-- NIVEL 5: Tablas que dependen del nivel 4
-- ============================================================================

-- Historial de pausas de pendientes
CREATE TABLE public.pause_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  pendiente_id uuid NOT NULL,
  paused_at timestamp with time zone NOT NULL DEFAULT now(),
  resumed_at timestamp with time zone,
  motivo text,
  paused_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pause_logs_pkey PRIMARY KEY (id),
  CONSTRAINT pause_logs_pendiente_id_fkey FOREIGN KEY (pendiente_id) REFERENCES public.pendientes(id) ON DELETE CASCADE,
  CONSTRAINT pause_logs_paused_by_fkey FOREIGN KEY (paused_by) REFERENCES public.profiles(id)
);

-- Notas rápidas (legacy - fusionado con pendientes)
CREATE TABLE public.notas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  proyecto_id uuid NOT NULL,
  contenido text NOT NULL,
  area text,
  autor_id uuid NOT NULL,
  convertida_a_pendiente boolean DEFAULT false,
  pendiente_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notas_pkey PRIMARY KEY (id),
  CONSTRAINT notas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE,
  CONSTRAINT notas_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.profiles(id),
  CONSTRAINT notas_pendiente_id_fkey FOREIGN KEY (pendiente_id) REFERENCES public.pendientes(id) ON DELETE SET NULL
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Búsquedas frecuentes por proyecto
CREATE INDEX idx_visitas_proyecto ON public.visitas(proyecto_id);
CREATE INDEX idx_pendientes_proyecto ON public.pendientes(proyecto_id);
CREATE INDEX idx_pendientes_area ON public.pendientes(proyecto_id, area);
CREATE INDEX idx_pendientes_encargado ON public.pendientes(encargado_id);
CREATE INDEX idx_pendientes_estado ON public.pendientes(proyecto_id, estado);
CREATE INDEX idx_materiales_proyecto ON public.materiales(proyecto_id);
CREATE INDEX idx_facturas_proyecto ON public.facturas(proyecto_id);
CREATE INDEX idx_facturas_proveedor ON public.facturas(proyecto_id, proveedor);
CREATE INDEX idx_asistencia_proyecto_fecha ON public.asistencia(proyecto_id, fecha);
CREATE INDEX idx_checkbox_checks_fecha ON public.checkbox_checks(item_id, fecha);
CREATE INDEX idx_programa_sectores_proyecto ON public.programa_sectores(proyecto_id);
CREATE INDEX idx_documentos_proyecto ON public.documentos(proyecto_id);
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id, leida);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Habilitar RLS en todas las tablas
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pause_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkbox_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Profiles: usuarios pueden ver todos los profiles, solo editar el propio
CREATE POLICY "Profiles son visibles para usuarios autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Proyectos: usuarios ven proyectos donde están asignados
CREATE POLICY "Usuarios ven proyectos asignados"
  ON public.proyectos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = proyectos.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins pueden crear proyectos"
  ON public.proyectos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins y jefes pueden actualizar proyectos"
  ON public.proyectos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'jefe_proyecto')
    )
    AND EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = proyectos.id AND user_id = auth.uid()
    )
  );

-- Proyecto usuarios: control de asignaciones
CREATE POLICY "Ver asignaciones de proyectos propios"
  ON public.proyecto_usuarios FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.proyecto_usuarios pu
    WHERE pu.proyecto_id = proyecto_usuarios.proyecto_id AND pu.user_id = auth.uid()
  ));

CREATE POLICY "Admins gestionan asignaciones"
  ON public.proyecto_usuarios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'jefe_proyecto')
    )
  );

-- Política genérica para tablas dependientes de proyecto
-- (visitas, pendientes, materiales, facturas, etc.)

CREATE POLICY "Acceso a visitas por proyecto"
  ON public.visitas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = visitas.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a asuntos por proyecto"
  ON public.asuntos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visitas v
      JOIN public.proyecto_usuarios pu ON pu.proyecto_id = v.proyecto_id
      WHERE v.id = asuntos.visita_id AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a pendientes por proyecto"
  ON public.pendientes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = pendientes.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a pause_logs por proyecto"
  ON public.pause_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pendientes p
      JOIN public.proyecto_usuarios pu ON pu.proyecto_id = p.proyecto_id
      WHERE p.id = pause_logs.pendiente_id AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a checkbox_items por proyecto"
  ON public.checkbox_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = checkbox_items.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a checkbox_checks por proyecto"
  ON public.checkbox_checks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.checkbox_items ci
      JOIN public.proyecto_usuarios pu ON pu.proyecto_id = ci.proyecto_id
      WHERE ci.id = checkbox_checks.item_id AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a asistencia por proyecto"
  ON public.asistencia FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = asistencia.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a materiales por proyecto"
  ON public.materiales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = materiales.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a facturas por proyecto"
  ON public.facturas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = facturas.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a documentos por proyecto"
  ON public.documentos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = documentos.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a permisos por proyecto"
  ON public.permisos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = permisos.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a informes por proyecto"
  ON public.informes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = informes.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a presupuesto_items por proyecto"
  ON public.presupuesto_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = presupuesto_items.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Acceso a programa_sectores por proyecto"
  ON public.programa_sectores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = programa_sectores.proyecto_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios ven sus notificaciones"
  ON public.notificaciones FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Sistema puede crear notificaciones"
  ON public.notificaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios actualizan sus notificaciones"
  ON public.notificaciones FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Acceso a notas por proyecto"
  ON public.notas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proyecto_usuarios
      WHERE proyecto_id = notas.proyecto_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS PARA updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_proyectos
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_visitas
  BEFORE UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_pendientes
  BEFORE UPDATE ON public.pendientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_checkbox_items
  BEFORE UPDATE ON public.checkbox_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_materiales
  BEFORE UPDATE ON public.materiales
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_facturas
  BEFORE UPDATE ON public.facturas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_documentos
  BEFORE UPDATE ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_permisos
  BEFORE UPDATE ON public.permisos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_presupuesto_items
  BEFORE UPDATE ON public.presupuesto_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_programa_sectores
  BEFORE UPDATE ON public.programa_sectores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_notas
  BEFORE UPDATE ON public.notas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TRIGGER PARA CREAR PROFILE AL REGISTRARSE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol, telefono)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'trabajador'),
    COALESCE(NEW.raw_user_meta_data->>'telefono', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Ejecutar en Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('facturas', 'facturas', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pendientes', 'pendientes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
