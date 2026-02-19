-- =============================================================================
-- ESANT MARIA - Mock Data: Casa La Dehesa
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =============================================================================
-- Usuarios existentes:
--   admin:          501fde31-269e-47c0-b29c-4e7634982011 (maxihnen@gmail.com)
--   jefe_proyecto:  dedb7598-896d-4b86-a353-d4fa00e6a748 (max@patagoniadevs.com)
-- =============================================================================

BEGIN;

-- UUIDs fijos para referencias cruzadas
DO $$
DECLARE
  -- Usuarios
  v_admin    uuid := '501fde31-269e-47c0-b29c-4e7634982011';
  v_jefe     uuid := 'dedb7598-896d-4b86-a353-d4fa00e6a748';

  -- Proyecto
  v_proyecto uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Visitas
  v_visita1  uuid := '11111111-1111-1111-1111-111111111101';
  v_visita2  uuid := '11111111-1111-1111-1111-111111111102';
  v_visita3  uuid := '11111111-1111-1111-1111-111111111103';

  -- Facturas
  v_fact1    uuid := '22222222-2222-2222-2222-222222222201';
  v_fact2    uuid := '22222222-2222-2222-2222-222222222202';
  v_fact3    uuid := '22222222-2222-2222-2222-222222222203';
  v_fact4    uuid := '22222222-2222-2222-2222-222222222204';

  -- Pendientes
  v_pend1    uuid := '33333333-3333-3333-3333-333333333301';
  v_pend2    uuid := '33333333-3333-3333-3333-333333333302';
  v_pend3    uuid := '33333333-3333-3333-3333-333333333303';
  v_pend4    uuid := '33333333-3333-3333-3333-333333333304';
  v_pend5    uuid := '33333333-3333-3333-3333-333333333305';
  v_pend6    uuid := '33333333-3333-3333-3333-333333333306';
  v_pend7    uuid := '33333333-3333-3333-3333-333333333307';
  v_pend8    uuid := '33333333-3333-3333-3333-333333333308';

  -- Checkbox items
  v_chk1     uuid := '44444444-4444-4444-4444-444444444401';
  v_chk2     uuid := '44444444-4444-4444-4444-444444444402';
  v_chk3     uuid := '44444444-4444-4444-4444-444444444403';
  v_chk4     uuid := '44444444-4444-4444-4444-444444444404';
  v_chk5     uuid := '44444444-4444-4444-4444-444444444405';
  v_chk6     uuid := '44444444-4444-4444-4444-444444444406';

  -- Asuntos
  v_asunto1  uuid := '55555555-5555-5555-5555-555555555501';
  v_asunto2  uuid := '55555555-5555-5555-5555-555555555502';
  v_asunto3  uuid := '55555555-5555-5555-5555-555555555503';
  v_asunto4  uuid := '55555555-5555-5555-5555-555555555504';

BEGIN

-- =============================================================================
-- 1. PROYECTO
-- =============================================================================
INSERT INTO proyectos (id, nombre, cliente, estado, fecha_inicio, fecha_estimada_fin, direccion, descripcion, presupuesto_total)
VALUES (
  v_proyecto,
  'Casa La Dehesa',
  'Familia Rodríguez',
  'en_obra',
  '2025-11-01T00:00:00Z',
  '2026-06-30T00:00:00Z',
  'Av. La Dehesa 1250, Lo Barnechea, Santiago',
  'Construcción de casa residencial de 280m², 2 pisos, 4 dormitorios, 3 baños, jardín y terraza.',
  185000000
);

-- =============================================================================
-- 2. PROYECTO_USUARIOS
-- =============================================================================
INSERT INTO proyecto_usuarios (proyecto_id, user_id) VALUES
  (v_proyecto, v_admin),
  (v_proyecto, v_jefe);

-- =============================================================================
-- 3. PROGRAMA_SECTORES (8 sectores con estados variados)
-- =============================================================================
INSERT INTO programa_sectores (id, proyecto_id, sector_nombre, fecha_inicio, fecha_entrega_propuesta, fecha_entrega_real, obras, valor_estimado, valor_actual, status) VALUES
  (uuid_generate_v4(), v_proyecto, 'General',           '2025-11-01', '2026-06-30', NULL,          'Obra gruesa, fundaciones, estructura general',       45000000, 38000000, 'en_curso'),
  (uuid_generate_v4(), v_proyecto, 'Cocina',            '2026-01-15', '2026-03-15', NULL,          'Muebles de cocina, cubierta, artefactos, cerámicos', 22000000, 12500000, 'en_curso'),
  (uuid_generate_v4(), v_proyecto, 'Pieza principal',   '2026-02-01', '2026-04-01', NULL,          'Piso flotante, closet empotrado, pintura',           15000000, 3200000,  'en_curso'),
  (uuid_generate_v4(), v_proyecto, 'Baño principal',    '2026-02-01', '2026-03-20', NULL,          'Cerámicos, grifería, mueble vanitorio, espejo',      12000000, 2000000,  'pendiente'),
  (uuid_generate_v4(), v_proyecto, 'Living',            '2026-03-01', '2026-04-15', NULL,          'Piso porcelanato, pintura, iluminación',              18000000, NULL,     'pendiente'),
  (uuid_generate_v4(), v_proyecto, 'Terraza',           '2026-04-01', '2026-05-15', NULL,          'Deck madera, pérgola, iluminación exterior',          14000000, NULL,     'pendiente'),
  (uuid_generate_v4(), v_proyecto, 'Jardín',            '2025-12-01', '2026-01-31', NULL,          'Paisajismo, riego automático, césped',                 8000000, 7800000,  'pausado'),
  (uuid_generate_v4(), v_proyecto, 'Entrada',           '2025-12-15', '2026-02-01', '2026-01-28', 'Portón, cierro perimetral, iluminación acceso',        9000000, 8700000,  'entregado');

-- =============================================================================
-- 4. PRESUPUESTO_ITEMS (6 partidas)
-- =============================================================================
INSERT INTO presupuesto_items (id, proyecto_id, categoria, descripcion, monto_estimado, monto_real, porcentaje_ejecutado) VALUES
  (uuid_generate_v4(), v_proyecto, 'diseño',        'Diseño arquitectónico y planos',                  8500000,  8500000, 100),
  (uuid_generate_v4(), v_proyecto, 'construccion',   'Obra gruesa y terminaciones estructurales',       65000000, 42000000, 65),
  (uuid_generate_v4(), v_proyecto, 'materiales',     'Materiales de construcción y terminaciones',      45000000, 28000000, 62),
  (uuid_generate_v4(), v_proyecto, 'otro',           'Mano de obra maestros y ayudantes',               35000000, 19500000, 56),
  (uuid_generate_v4(), v_proyecto, 'mobiliario',     'Muebles de cocina, closets, vanitorio',           18000000, 4200000,  23),
  (uuid_generate_v4(), v_proyecto, 'otro',           'Imprevistos y trabajos adicionales',              13500000, 3800000,  28);

-- =============================================================================
-- 5. VISITAS (3 visitas)
-- =============================================================================
INSERT INTO visitas (id, proyecto_id, fecha, hora, estado, notas_generales, creado_por) VALUES
  (v_visita1, v_proyecto, '2026-02-10T10:00:00Z', '10:00', 'completada', 'Revisión avance obra gruesa segundo piso. Se detectaron problemas en instalación eléctrica cocina.', v_jefe),
  (v_visita2, v_proyecto, '2026-02-17T10:00:00Z', '10:00', 'completada', 'Verificación cerámicos baño principal y avance cocina. Proveedor de grifería confirmó despacho para el 21/02.', v_jefe),
  (v_visita3, v_proyecto, '2026-02-24T10:00:00Z', '10:00', 'programada', NULL, v_admin);

-- =============================================================================
-- 6. ASUNTOS (4 asuntos de visitas)
-- =============================================================================
INSERT INTO asuntos (id, visita_id, area, descripcion, encargado_id, notas_adicionales, convertido_a_pendiente) VALUES
  (v_asunto1, v_visita1, 'Cocina',          'Cableado eléctrico no cumple con norma SEC, requiere recableado parcial',                     v_admin, 'Electricista debe venir a corregir antes del viernes', true),
  (v_asunto2, v_visita1, 'General',          'Falta impermeabilización en muro poniente del segundo piso',                                   v_jefe,  NULL, true),
  (v_asunto3, v_visita2, 'Baño principal',   'Cerámicos llegaron con tonalidad distinta al muestrario, verificar con proveedor',             v_jefe,  'Lote #4522 vs muestrario original', false),
  (v_asunto4, v_visita2, 'Cocina',          'Cubierta de granito tiene medidas correctas, proceder con instalación',                        v_admin, NULL, false);

-- =============================================================================
-- 7. FACTURAS (4 facturas de distintos proveedores)
-- =============================================================================
INSERT INTO facturas (id, proyecto_id, numero, fecha, valor, valor_con_iva, proveedor, pagado_por, detalle, sucursal, rut, direccion, sector_nombre) VALUES
  (v_fact1, v_proyecto, 'F-2024-0891', '2026-01-15', 4200000, 4998000, 'Sodimac',          'Empresa',  'Cerámicos baño y cocina, adhesivo, fragüe',          'Sodimac La Dehesa',       '96.523.780-2', 'Av. La Dehesa 1945',        'Cocina'),
  (v_fact2, v_proyecto, 'F-2024-1205', '2026-01-28', 2800000, 3332000, 'Easy',             'Empresa',  'Piso flotante pieza principal, molduras, zócalos',    'Easy Kennedy',            '96.671.750-8', 'Av. Kennedy 9001',          'Pieza principal'),
  (v_fact3, v_proyecto, 'BV-38742',    '2026-02-05', 6500000, 7735000, 'Arauco',           'Empresa',  'Tableros melamina, MDF para muebles cocina y closet', 'Planta Arauco Santiago',  '77.019.830-2', 'Camino a Melipilla Km 22',  'Cocina'),
  (v_fact4, v_proyecto, 'FC-00214',    '2026-02-12', 1850000, 2201500, 'Grifería Nacional', 'Empresa', 'Grifería completa baño principal y cocina',            'Showroom Providencia',    '76.445.210-5', 'Av. Providencia 2315',      'Baño principal');

-- =============================================================================
-- 8. CHECKBOX_ITEMS (6 items de verificación)
-- =============================================================================
INSERT INTO checkbox_items (id, proyecto_id, sector_nombre, descripcion, periodicidad, activo) VALUES
  (v_chk1, v_proyecto, 'General',          'Verificar uso de EPP en todos los trabajadores',          'diario',   true),
  (v_chk2, v_proyecto, 'General',          'Revisar orden y limpieza de obra',                         'diario',   true),
  (v_chk3, v_proyecto, 'General',          'Verificar estado de andamios y escaleras',                 'semanal',  true),
  (v_chk4, v_proyecto, 'Cocina',           'Verificar avance instalación eléctrica',                   'diario',   true),
  (v_chk5, v_proyecto, 'Pieza principal',  'Revisar nivelación piso flotante',                         'semanal',  true),
  (v_chk6, v_proyecto, 'General',          'Inspección general de seguridad y prevención de riesgos',  'quincenal', true);

-- =============================================================================
-- 9. CHECKBOX_CHECKS (checks de últimos días)
-- =============================================================================
INSERT INTO checkbox_checks (id, item_id, fecha, completado, checked_by) VALUES
  -- 17 Feb
  (uuid_generate_v4(), v_chk1, '2026-02-17', true,  v_jefe),
  (uuid_generate_v4(), v_chk2, '2026-02-17', true,  v_jefe),
  (uuid_generate_v4(), v_chk4, '2026-02-17', true,  v_admin),
  -- 18 Feb
  (uuid_generate_v4(), v_chk1, '2026-02-18', true,  v_jefe),
  (uuid_generate_v4(), v_chk2, '2026-02-18', false, v_jefe),
  (uuid_generate_v4(), v_chk4, '2026-02-18', true,  v_jefe),
  -- 19 Feb (hoy)
  (uuid_generate_v4(), v_chk1, '2026-02-19', true,  v_admin),
  (uuid_generate_v4(), v_chk2, '2026-02-19', true,  v_admin);

-- =============================================================================
-- 10. MATERIALES (5 materiales vinculados a facturas)
-- =============================================================================
INSERT INTO materiales (id, proyecto_id, codigo, descripcion, marca, modelo, sucursal, cantidad, proveedor, ubicacion, factura_id, sector_nombre, estado) VALUES
  (uuid_generate_v4(), v_proyecto, 'CER-001',  'Cerámica muro cocina 30x60 blanco mate',  'Cordillera',  'Blanco Mate 30x60',  'Sodimac La Dehesa',       48, 'Sodimac',           'Bodega obra',       v_fact1, 'Cocina',          'disponible'),
  (uuid_generate_v4(), v_proyecto, 'CER-002',  'Cerámica piso cocina 60x60 gris',         'Cordillera',  'Gris Cemento 60x60', 'Sodimac La Dehesa',       35, 'Sodimac',           'Bodega obra',       v_fact1, 'Cocina',          'disponible'),
  (uuid_generate_v4(), v_proyecto, 'PIS-001',  'Piso flotante roble natural 8mm',          'Kronotex',    'Roble Natural D2999','Easy Kennedy',            52, 'Easy',              'En instalación',    v_fact2, 'Pieza principal', 'disponible'),
  (uuid_generate_v4(), v_proyecto, 'TAB-001',  'Tablero melamina blanca 18mm',             'Arauco',      'Melamina 18mm',      'Planta Arauco Santiago',  24, 'Arauco',            'Taller carpintero', v_fact3, 'Cocina',          'disponible'),
  (uuid_generate_v4(), v_proyecto, 'GRI-001',  'Grifería lavaplatos monocomando',          'FV',          'Libby Cocina',       'Showroom Providencia',     1, 'Grifería Nacional', 'Por instalar',      v_fact4, 'Cocina',          'por_comprar');

-- =============================================================================
-- 11. PENDIENTES (8 tareas con estados variados)
-- =============================================================================
INSERT INTO pendientes (id, proyecto_id, area, tarea, descripcion, encargado_id, estado, prioridad, fecha_creacion, fecha_vencimiento, fecha_completado, notas_adicionales, creado_por, visita_id, asunto_id) VALUES
  -- Derivados de visitas
  (v_pend1, v_proyecto, 'Cocina',          'Corregir cableado eléctrico cocina',                   'Recableado parcial zona horno y encimera según norma SEC. Electricista debe verificar tablero.',  v_admin, 'en_progreso', 'alta',  '2026-02-10T12:00:00Z', '2026-02-21T00:00:00Z', NULL,                     'Electricista confirmó visita para el 20/02',                v_jefe,  v_visita1, v_asunto1),
  (v_pend2, v_proyecto, 'General',          'Impermeabilizar muro poniente segundo piso',           'Aplicar impermeabilizante en muro exterior poniente. Se detectó humedad en visita del 10/02.',    v_jefe,  'creada',      'alta',  '2026-02-10T12:30:00Z', '2026-02-25T00:00:00Z', NULL,                     NULL,                                                        v_jefe,  v_visita1, v_asunto2),

  -- Tareas regulares
  (v_pend3, v_proyecto, 'Cocina',          'Instalar cubierta de granito',                          'Cubierta de granito negro 20mm para mesón principal. Medidas verificadas en visita del 17/02.',    v_admin, 'creada',      'media', '2026-02-17T14:00:00Z', '2026-03-01T00:00:00Z', NULL,                     'Proveedor confirma despacho semana del 24/02',              v_jefe,  v_visita2, NULL),
  (v_pend4, v_proyecto, 'Pieza principal', 'Completar instalación piso flotante',                   'Faltan 12m² en zona closet y pasillo interior. Material disponible en bodega.',                    v_jefe,  'en_progreso', 'media', '2026-02-05T09:00:00Z', '2026-02-22T00:00:00Z', NULL,                     'Avance al 70%, falta zona closet',                          v_admin, NULL,      NULL),
  (v_pend5, v_proyecto, 'Baño principal',  'Definir layout cerámicos baño principal',               'Revisar tonalidad de cerámicos recibidos vs muestrario. Coordinar con proveedor si hay diferencia.', v_jefe, 'pausada',  'media', '2026-02-12T10:00:00Z', '2026-02-28T00:00:00Z', NULL,                     'En espera de respuesta del proveedor sobre lote #4522',     v_jefe,  NULL,      NULL),
  (v_pend6, v_proyecto, 'Entrada',         'Pintar portón de acceso',                               'Pintura anticorrosiva + esmalte negro mate para portón metálico de entrada.',                      v_admin, 'completada',  'baja',  '2026-01-20T08:00:00Z', '2026-02-05T00:00:00Z', '2026-02-03T16:00:00Z',  'Terminado antes de plazo, 2 manos aplicadas',              v_admin, NULL,      NULL),
  (v_pend7, v_proyecto, 'Jardín',          'Reparar sistema de riego zona norte',                   'Cañería rota en tramo norte del jardín. Reemplazar 3 metros de tubería y 2 aspersores.',           v_jefe,  'pausada',     'baja',  '2026-02-01T11:00:00Z', '2026-03-15T00:00:00Z', NULL,                     'Pausado hasta que termine obra gruesa adyacente',           v_admin, NULL,      NULL),
  (v_pend8, v_proyecto, 'General',          'Solicitar inspección municipal avance obra',            'Coordinar con DOM de Lo Barnechea para inspección de avance según permiso de edificación.',        v_admin, 'creada',      'alta',  '2026-02-18T09:00:00Z', '2026-03-05T00:00:00Z', NULL,                     NULL,                                                        v_jefe,  NULL,      NULL);

-- =============================================================================
-- 12. PAUSE_LOGS (2 registros de pausa)
-- =============================================================================
INSERT INTO pause_logs (id, pendiente_id, paused_at, resumed_at, motivo, paused_by) VALUES
  (uuid_generate_v4(), v_pend5, '2026-02-14T10:00:00Z', NULL,                     'En espera de respuesta del proveedor sobre diferencia de tonalidad en cerámicos', v_jefe),
  (uuid_generate_v4(), v_pend7, '2026-02-08T14:00:00Z', NULL,                     'Obra gruesa adyacente impide acceso a zona de riego',                             v_admin);

-- =============================================================================
-- 13. ASISTENCIA (últimos 3 días, usando ambos usuarios como referencia)
-- =============================================================================
INSERT INTO asistencia (id, proyecto_id, trabajador_id, fecha, presente, registrado_por) VALUES
  -- 17 Feb
  (uuid_generate_v4(), v_proyecto, v_admin, '2026-02-17', true,  v_jefe),
  (uuid_generate_v4(), v_proyecto, v_jefe,  '2026-02-17', true,  v_jefe),
  -- 18 Feb
  (uuid_generate_v4(), v_proyecto, v_admin, '2026-02-18', true,  v_jefe),
  (uuid_generate_v4(), v_proyecto, v_jefe,  '2026-02-18', false, v_admin),
  -- 19 Feb (hoy)
  (uuid_generate_v4(), v_proyecto, v_admin, '2026-02-19', true,  v_jefe),
  (uuid_generate_v4(), v_proyecto, v_jefe,  '2026-02-19', true,  v_admin);

END;
$$;

COMMIT;
