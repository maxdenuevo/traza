-- =====================================================
-- TRAZA Database Schema for Supabase
-- Complete schema with RLS policies (NO RECURSION)
-- =====================================================
-- Execute this entire file in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== TABLES ====================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'jefe_proyecto', 'especialista', 'cliente')),
  telefono TEXT NOT NULL,
  especialidad TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  cliente TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('planificacion', 'en_obra', 'pausado', 'terminado')),
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_estimada_fin TIMESTAMP WITH TIME ZONE,
  direccion TEXT,
  descripcion TEXT,
  presupuesto_total NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table: proyectos <-> usuarios
CREATE TABLE IF NOT EXISTS proyecto_usuarios (
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (proyecto_id, user_id)
);

-- Visitas
CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  hora TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('programada', 'en_curso', 'completada')),
  notas_generales TEXT,
  creado_por UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asuntos (issues from visits)
CREATE TABLE IF NOT EXISTS asuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  area TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  encargado_id UUID REFERENCES profiles(id),
  notas_adicionales TEXT,
  convertido_a_pendiente BOOLEAN DEFAULT FALSE,
  pendiente_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pendientes (tasks)
CREATE TABLE IF NOT EXISTS pendientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  area TEXT NOT NULL,
  tarea TEXT NOT NULL,
  descripcion TEXT,
  encargado_id UUID REFERENCES profiles(id) NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pausa', 'en_obra', 'terminado')),
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta')),
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  notas_adicionales TEXT,
  creado_por UUID REFERENCES profiles(id) NOT NULL,
  visita_id UUID REFERENCES visitas(id),
  asunto_id UUID REFERENCES asuntos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'docx', 'xlsx', 'dwg', 'jpg', 'png', 'otro')),
  categoria TEXT NOT NULL CHECK (categoria IN ('planos', 'permisos', 'anteproyecto', 'presupuesto', 'contratos', 'fotos', 'otro')),
  url TEXT NOT NULL,
  tamaño BIGINT NOT NULL,
  estado TEXT CHECK (estado IN ('borrador', 'revision', 'aprobado', 'vigente', 'vencido')),
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  subio_por UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notas
CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  area TEXT,
  autor_id UUID REFERENCES profiles(id) NOT NULL,
  convertida_a_pendiente BOOLEAN DEFAULT FALSE,
  pendiente_id UUID REFERENCES pendientes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('tarea_asignada', 'tarea_actualizada', 'visita_programada', 'documento_subido', 'presupuesto_actualizado', 'mensaje')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  enlace_accion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presupuesto Items
CREATE TABLE IF NOT EXISTS presupuesto_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('diseño', 'construccion', 'materiales', 'mobiliario', 'otro')),
  descripcion TEXT NOT NULL,
  monto_estimado NUMERIC(12, 2) NOT NULL,
  monto_real NUMERIC(12, 2),
  porcentaje_ejecutado INTEGER DEFAULT 0 CHECK (porcentaje_ejecutado >= 0 AND porcentaje_ejecutado <= 100),
  archivo_url TEXT,
  notifica_cambios BOOLEAN DEFAULT FALSE,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permisos
CREATE TABLE IF NOT EXISTS permisos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('edificacion', 'municipal', 'recepcion_obra', 'otro')),
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_tramite', 'aprobado', 'vencido')),
  fecha_solicitud TIMESTAMP WITH TIME ZONE,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  vigencia_meses INTEGER,
  documento_id UUID REFERENCES documentos(id),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_proyecto_usuarios_user ON proyecto_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_usuarios_proyecto ON proyecto_usuarios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_visitas_proyecto ON visitas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_asuntos_visita ON asuntos(visita_id);
CREATE INDEX IF NOT EXISTS idx_pendientes_proyecto ON pendientes(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pendientes_encargado ON pendientes(encargado_id);
CREATE INDEX IF NOT EXISTS idx_pendientes_estado ON pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_proyecto ON documentos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_notas_proyecto ON notas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_presupuesto_proyecto ON presupuesto_items(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_permisos_proyecto ON permisos(proyecto_id);

-- ==================== TRIGGERS ====================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitas_updated_at BEFORE UPDATE ON visitas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pendientes_updated_at BEFORE UPDATE ON pendientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON notas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuesto_items_updated_at BEFORE UPDATE ON presupuesto_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permisos_updated_at BEFORE UPDATE ON permisos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== AUTH FUNCTION ====================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol, telefono)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'especialista'),
    COALESCE(NEW.raw_user_meta_data->>'telefono', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== HELPER FUNCTIONS (SECURITY DEFINER) ====================
-- These functions bypass RLS to prevent infinite recursion

-- Get all project IDs for a user
CREATE OR REPLACE FUNCTION get_user_project_ids(user_uuid UUID)
RETURNS TABLE(proyecto_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT pu.proyecto_id
  FROM proyecto_usuarios pu
  WHERE pu.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin or jefe
CREATE OR REPLACE FUNCTION is_admin_or_jefe(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND rol IN ('admin', 'jefe_proyecto')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is member of specific project
CREATE OR REPLACE FUNCTION is_project_member(user_uuid UUID, project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM proyecto_usuarios
    WHERE user_id = user_uuid AND proyecto_id = project_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- PROYECTOS
CREATE POLICY "Users can view their projects" ON proyectos
  FOR SELECT USING (
    id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Admins and jefes can manage projects" ON proyectos
  FOR ALL USING (is_admin_or_jefe(auth.uid()));

-- PROYECTO_USUARIOS (no recursion)
CREATE POLICY "Users can view own memberships" ON proyecto_usuarios
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage memberships" ON proyecto_usuarios
  FOR ALL USING (is_admin_or_jefe(auth.uid()));

-- VISITAS
CREATE POLICY "Users can view visitas from their projects" ON visitas
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can create visitas" ON visitas
  FOR INSERT WITH CHECK (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
    AND creado_por = auth.uid()
  );

CREATE POLICY "Users can update visitas" ON visitas
  FOR UPDATE USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Admins and jefes can delete visitas" ON visitas
  FOR DELETE USING (
    is_admin_or_jefe(auth.uid())
    AND proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

-- ASUNTOS
CREATE POLICY "Users can view asuntos" ON asuntos
  FOR SELECT USING (
    visita_id IN (
      SELECT v.id FROM visitas v
      WHERE v.proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
    )
  );

CREATE POLICY "Users can manage asuntos" ON asuntos
  FOR ALL USING (
    visita_id IN (
      SELECT v.id FROM visitas v
      WHERE v.proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
    )
  );

-- PENDIENTES
CREATE POLICY "Users can view pendientes from their projects" ON pendientes
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can create pendientes" ON pendientes
  FOR INSERT WITH CHECK (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can update their pendientes" ON pendientes
  FOR UPDATE USING (
    encargado_id = auth.uid()
    OR creado_por = auth.uid()
    OR is_admin_or_jefe(auth.uid())
  );

CREATE POLICY "Admins and jefes can delete pendientes" ON pendientes
  FOR DELETE USING (is_admin_or_jefe(auth.uid()));

-- DOCUMENTOS
CREATE POLICY "Users can view documents from their projects" ON documentos
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can upload documents" ON documentos
  FOR INSERT WITH CHECK (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
    AND subio_por = auth.uid()
  );

CREATE POLICY "Admins and jefes can delete documents" ON documentos
  FOR DELETE USING (is_admin_or_jefe(auth.uid()));

-- NOTAS
CREATE POLICY "Users can view notas from their projects" ON notas
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can create notas" ON notas
  FOR INSERT WITH CHECK (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
    AND autor_id = auth.uid()
  );

CREATE POLICY "Users can update own notas" ON notas
  FOR UPDATE USING (autor_id = auth.uid());

CREATE POLICY "Users can delete own notas" ON notas
  FOR DELETE USING (autor_id = auth.uid());

-- NOTIFICACIONES
CREATE POLICY "Users can view own notifications" ON notificaciones
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notificaciones
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notificaciones
  FOR DELETE USING (usuario_id = auth.uid());

CREATE POLICY "System can create notifications" ON notificaciones
  FOR INSERT WITH CHECK (true);

-- PRESUPUESTO_ITEMS
CREATE POLICY "Users can view presupuesto from their projects" ON presupuesto_items
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Admins and jefes can manage presupuesto" ON presupuesto_items
  FOR ALL USING (
    is_admin_or_jefe(auth.uid())
    AND proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

-- PERMISOS
CREATE POLICY "Users can view permisos from their projects" ON permisos
  FOR SELECT USING (
    proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Admins and jefes can manage permisos" ON permisos
  FOR ALL USING (
    is_admin_or_jefe(auth.uid())
    AND proyecto_id IN (SELECT get_user_project_ids(auth.uid()))
  );

-- ==================== VERIFICATION ====================

DO $$
BEGIN
  RAISE NOTICE '✅ TRAZA Database Schema created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created: 11';
  RAISE NOTICE 'Indexes created: 15';
  RAISE NOTICE 'Triggers created: 8';
  RAISE NOTICE 'Helper functions: 3 (SECURITY DEFINER)';
  RAISE NOTICE 'RLS policies: Enabled on all tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first user via Supabase Auth';
  RAISE NOTICE '2. Set their rol to admin in the profiles table';
  RAISE NOTICE '3. Test the connection from your app';
END $$;
